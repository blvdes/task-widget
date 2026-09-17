use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;
use std::sync::atomic::{AtomicU64, Ordering};
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Emitter, Manager, State,
};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};
use tauri_plugin_opener::OpenerExt;

mod desktop_windows;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TagConfig {
    pub name: String,
    pub color: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct KeywordConfig {
    pub word: String,
    pub color: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WindowState {
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
    pub rolled_up: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppConfig {
    pub files: Vec<String>,
    pub active_file_index: usize,
    pub open_on_startup: bool,
    pub rolled_up_on_startup: bool,
    pub font_family: String,
    pub font_size: u32,
    pub opacity: f64,
    pub blur: u32,
    pub peek_hotkey: String,
    pub tags: Vec<TagConfig>,
    pub keywords: Vec<KeywordConfig>,
    pub window: WindowState,
    pub section_collapse: std::collections::HashMap<String, bool>,
    #[serde(default)]
    pub task_collapse: std::collections::HashMap<String, bool>,
    #[serde(default)]
    pub hide_completed: bool,
    #[serde(default)]
    pub solid_background: bool,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            files: vec![],
            active_file_index: 0,
            open_on_startup: true,
            rolled_up_on_startup: true,
            font_family: "Inter".into(),
            font_size: 13,
            opacity: 0.88,
            blur: 24,
            peek_hotkey: "Ctrl+Shift+Space".into(),
            tags: vec![
                TagConfig {
                    name: "urgent".into(),
                    color: "#ff6b6b".into(),
                },
                TagConfig {
                    name: "waiting".into(),
                    color: "#ffd166".into(),
                },
            ],
            keywords: vec![
                KeywordConfig {
                    word: "IMPOSSIBLE".into(),
                    color: "#ff6b6b".into(),
                },
                KeywordConfig {
                    word: "MUST".into(),
                    color: "#ffd166".into(),
                },
                KeywordConfig {
                    word: "COMPLETED".into(),
                    color: "#06d6a0".into(),
                },
            ],
            window: WindowState {
                x: 40.0,
                y: 80.0,
                width: 340.0,
                height: 560.0,
                rolled_up: true,
            },
            section_collapse: std::collections::HashMap::new(),
            task_collapse: std::collections::HashMap::new(),
            hide_completed: false,
            solid_background: false,
        }
    }
}

#[tauri::command]
fn set_solid_background(app: AppHandle, solid: bool) -> Result<(), String> {
    if let Some(w) = app.get_webview_window("main") {
        w.set_decorations(false).map_err(|e| e.to_string())?;
        let _ = solid;
    }
    Ok(())
}

struct AppState {
    config_path: PathBuf,
    meta_path: PathBuf,
}

fn config_dir() -> PathBuf {
    dirs::config_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("TaskPane")
}

fn ensure_config_dir() -> PathBuf {
    let dir = config_dir();
    let _ = fs::create_dir_all(&dir);
    dir
}

fn default_tasks_path() -> PathBuf {
    let docs = dirs::document_dir().unwrap_or_else(|| PathBuf::from("."));
    let path = docs.join("TaskPane").join("tasks.md");
    if let Some(parent) = path.parent() {
        let _ = fs::create_dir_all(parent);
    }
    if !path.exists() {
        let sample = include_str!("../../sample/tasks.md");
        let _ = fs::write(&path, sample);
    }
    path
}

#[tauri::command]
fn read_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| e.to_string())
}

#[tauri::command]
fn write_file(path: String, content: String) -> Result<(), String> {
    if let Some(parent) = PathBuf::from(&path).parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    fs::write(&path, content).map_err(|e| e.to_string())
}

#[tauri::command]
fn load_config(state: State<'_, Mutex<AppState>>) -> Result<AppConfig, String> {
    let guard = state.lock().map_err(|e| e.to_string())?;
    if !guard.config_path.exists() {
        return Ok(AppConfig::default());
    }
    let raw = fs::read_to_string(&guard.config_path).map_err(|e| e.to_string())?;
    serde_json::from_str(&raw).map_err(|e| e.to_string())
}

#[tauri::command]
fn save_config(state: State<'_, Mutex<AppState>>, config: AppConfig) -> Result<(), String> {
    let guard = state.lock().map_err(|e| e.to_string())?;
    let raw = serde_json::to_string_pretty(&config).map_err(|e| e.to_string())?;
    fs::write(&guard.config_path, raw).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_default_tasks_path() -> Result<String, String> {
    Ok(default_tasks_path().to_string_lossy().to_string())
}

#[tauri::command]
fn file_mtime(path: String) -> Result<u64, String> {
    let meta = fs::metadata(&path).map_err(|e| e.to_string())?;
    meta.modified()
        .map_err(|e| e.to_string())?
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_secs())
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn import_txt(path: String) -> Result<String, String> {
    let raw = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    Ok(raw)
}

#[tauri::command]
fn open_url(app: AppHandle, url: String) -> Result<(), String> {
    app.opener()
        .open_url(url, None::<&str>)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn set_startup(_app: AppHandle, enabled: bool) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        if enabled {
            let exe = std::env::current_exe().map_err(|e| e.to_string())?;
            let exe_str = exe.to_string_lossy();
            std::process::Command::new("schtasks")
                .args([
                    "/Create",
                    "/TN",
                    "TaskPane",
                    "/TR",
                    &format!("\"{}\"", exe_str),
                    "/SC",
                    "ONLOGON",
                    "/RL",
                    "LIMITED",
                    "/F",
                ])
                .creation_flags(CREATE_NO_WINDOW)
                .output()
                .map_err(|e| e.to_string())?;
        } else {
            std::process::Command::new("schtasks")
                .args(["/Delete", "/TN", "TaskPane", "/F"])
                .creation_flags(CREATE_NO_WINDOW)
                .output()
                .map_err(|e| e.to_string())?;
        }
    }
    let _ = enabled;
    Ok(())
}

#[tauri::command]
fn bring_to_front(app: AppHandle) -> Result<(), String> {
    if let Some(w) = app.get_webview_window("main") {
        w.set_always_on_top(true).map_err(|e| e.to_string())?;
        w.show().map_err(|e| e.to_string())?;
        w.set_focus().map_err(|e| e.to_string())?;
    }
    Ok(())
}

fn attach_window_to_desktop(app: &AppHandle, label: &str) {
    if let Some(w) = app.get_webview_window(label) {
        let _ = w.set_always_on_top(false);
        #[cfg(target_os = "windows")]
        let _ = desktop_windows::embed_to_desktop(&w);
    }
}

#[tauri::command]
fn send_to_desktop_layer(app: AppHandle) -> Result<(), String> {
    attach_window_to_desktop(&app, "main");
    Ok(())
}

#[tauri::command]
fn show_spotlight(app: AppHandle) -> Result<(), String> {
    app.emit("spotlight-open", ()).map_err(|e| e.to_string())
}

#[tauri::command]
fn load_meta(state: State<'_, Mutex<AppState>>) -> Result<std::collections::HashMap<String, i64>, String> {
    let guard = state.lock().map_err(|e| e.to_string())?;
    if !guard.meta_path.exists() {
        return Ok(std::collections::HashMap::new());
    }
    let raw = fs::read_to_string(&guard.meta_path).map_err(|e| e.to_string())?;
    serde_json::from_str(&raw).map_err(|e| e.to_string())
}

#[tauri::command]
fn save_meta(
    state: State<'_, Mutex<AppState>>,
    meta: std::collections::HashMap<String, i64>,
) -> Result<(), String> {
    let guard = state.lock().map_err(|e| e.to_string())?;
    let raw = serde_json::to_string_pretty(&meta).map_err(|e| e.to_string())?;
    fs::write(&guard.meta_path, raw).map_err(|e| e.to_string())
}

#[tauri::command]
async fn detach_pane(app: AppHandle, file_path: String) -> Result<(), String> {
    use tauri::{WebviewUrl, WebviewWindowBuilder};

    let label = format!(
        "pane-{}",
        file_path
            .chars()
            .map(|c| if c.is_ascii_alphanumeric() { c } else { '_' })
            .collect::<String>()
    );

    if app.get_webview_window(&label).is_some() {
        if let Some(w) = app.get_webview_window(&label) {
            w.set_focus().map_err(|e| e.to_string())?;
        }
        return Ok(());
    }

    let url = format!("/?file={}", urlencoding::encode(&file_path));
    WebviewWindowBuilder::new(&app, &label, WebviewUrl::App(url.into()))
        .title("TaskPane")
        .inner_size(340.0, 560.0)
        .decorations(false)
        .transparent(true)
        .always_on_top(false)
        .skip_taskbar(true)
        .build()
        .map_err(|e| e.to_string())?;

    attach_window_to_desktop(&app, &label);

    Ok(())
}

fn setup_tray(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let quick_add = MenuItem::with_id(app, "quick_add", "Quick add task", true, None::<&str>)?;
    let show = MenuItem::with_id(app, "show", "Bring to front", true, None::<&str>)?;
    let desktop = MenuItem::with_id(app, "desktop", "Send to desktop layer", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&quick_add, &show, &desktop, &quit])?;

    static LAST_CLICK_MS: AtomicU64 = AtomicU64::new(0);

    TrayIconBuilder::new()
        .icon(app.default_window_icon().unwrap().clone())
        .menu(&menu)
        .on_menu_event(|app, event| match event.id.as_ref() {
            "quick_add" => {
                let _ = app.emit("spotlight-open", ());
            }
            "show" => {
                let _ = app.emit("tray-focus", ());
                if let Some(w) = app.get_webview_window("main") {
                    let _ = w.set_always_on_top(true);
                    let _ = w.show();
                    let _ = w.set_focus();
                }
            }
            "desktop" => {
                attach_window_to_desktop(app, "main");
            }
            "quit" => {
                app.exit(0);
            }
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                let now_ms = std::time::SystemTime::now()
                    .duration_since(std::time::UNIX_EPOCH)
                    .unwrap_or_default()
                    .as_millis() as u64;
                let prev = LAST_CLICK_MS.swap(now_ms, Ordering::Relaxed);
                let app = tray.app_handle();
                if now_ms.saturating_sub(prev) < 400 {
                    let _ = app.emit("tray-focus", ());
                    if let Some(w) = app.get_webview_window("main") {
                        let _ = w.set_always_on_top(true);
                        let _ = w.show();
                        let _ = w.set_focus();
                    }
                } else {
                    let _ = app.emit("spotlight-open", ());
                }
            }
        })
        .build(app)?;

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let config_path = ensure_config_dir().join("config.json");
    let meta_path = ensure_config_dir().join("meta.json");

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(|app, shortcut, event| {
                    let peek =
                        Shortcut::new(Some(Modifiers::CONTROL | Modifiers::SHIFT), Code::Space);
                    if shortcut == &peek && event.state == ShortcutState::Pressed {
                        let _ = app.emit("peek-toggle", ());
                        if let Some(w) = app.get_webview_window("main") {
                            let _ = w.set_always_on_top(true);
                            let _ = w.show();
                            let _ = w.set_focus();
                        }
                    }
                })
                .build(),
        )
        .manage(Mutex::new(AppState {
            config_path,
            meta_path,
        }))
        .invoke_handler(tauri::generate_handler![
            read_file,
            write_file,
            load_config,
            save_config,
            get_default_tasks_path,
            import_txt,
            file_mtime,
            open_url,
            set_startup,
            bring_to_front,
            send_to_desktop_layer,
            show_spotlight,
            load_meta,
            save_meta,
            detach_pane,
            set_solid_background,
        ])
        .setup(|app| {
            setup_tray(app.handle())?;

            let peek = Shortcut::new(Some(Modifiers::CONTROL | Modifiers::SHIFT), Code::Space);
            app.global_shortcut().register(peek)?;

            if let Some(w) = app.get_webview_window("main") {
                #[cfg(target_os = "windows")]
                {
                    let _ = desktop_windows::embed_to_desktop(&w);
                }
                #[cfg(target_os = "linux")]
                {
                    let _ = w.set_always_on_top(true);
                }
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running TaskPane");
}
