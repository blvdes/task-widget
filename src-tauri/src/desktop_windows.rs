//! Best-effort embed into the Windows desktop layer (WorkerW behind icons).
//! Falls back silently if the shell layout differs (virtual desktops, etc.).

#[cfg(target_os = "windows")]
pub fn embed_to_desktop(window: &tauri::WebviewWindow) -> Result<(), String> {
    use windows::Win32::Foundation::{HWND, LPARAM, WPARAM};
    use windows::Win32::UI::WindowsAndMessaging::{
        EnumWindows, FindWindowExW, FindWindowW, GetClassNameW, GetWindowLongPtrW,
        SendMessageTimeoutW, SetParent, SetWindowLongPtrW, SetWindowPos, ShowWindow, GWL_EXSTYLE,
        HWND_BOTTOM, SMTO_NORMAL, SW_SHOW, WS_EX_NOACTIVATE, WS_EX_TOOLWINDOW,
    };

    unsafe {
        let hwnd = HWND(window.hwnd()?.0);

        let progman = FindWindowW(windows::core::w!("Progman"), None);
        if progman.0 == 0 {
            return Err("Progman not found".into());
        }

        SendMessageTimeoutW(
            progman,
            0x052c,
            WPARAM(0xD),
            LPARAM(0),
            SMTO_NORMAL,
            1000,
            None,
        );

        let mut workerw: HWND = HWND(std::ptr::null_mut());
        EnumWindows(
            Some(enum_window_with_shell),
            LPARAM(&mut workerw as *mut _ as isize),
        )
        .ok()
        .map_err(|e| e.to_string())?;

        // Win11 may expose a second WorkerW without SHELLDLL_DefView
        if workerw.0 == 0 {
            EnumWindows(
                Some(enum_window_workerw_only),
                LPARAM(&mut workerw as *mut _ as isize),
            )
            .ok()
            .map_err(|e| e.to_string())?;
        }

        if workerw.0 == 0 {
            return Err("WorkerW not found".into());
        }

        let ex_style = GetWindowLongPtrW(hwnd, GWL_EXSTYLE);
        SetWindowLongPtrW(
            hwnd,
            GWL_EXSTYLE,
            ex_style | WS_EX_TOOLWINDOW.0 as isize | WS_EX_NOACTIVATE.0 as isize,
        );

        SetParent(hwnd, workerw).map_err(|e| e.to_string())?;
        SetWindowPos(
            hwnd,
            HWND_BOTTOM,
            0,
            0,
            0,
            0,
            windows::Win32::UI::WindowsAndMessaging::SWP_NOMOVE
                | windows::Win32::UI::WindowsAndMessaging::SWP_NOSIZE
                | windows::Win32::UI::WindowsAndMessaging::SWP_NOACTIVATE,
        )
        .ok()
        .map_err(|e| e.to_string())?;
        ShowWindow(hwnd, SW_SHOW);
    }

    Ok(())
}

#[cfg(target_os = "windows")]
unsafe extern "system" fn enum_window_with_shell(
    hwnd: windows::Win32::Foundation::HWND,
    lparam: windows::Win32::Foundation::LPARAM,
) -> windows::Win32::Foundation::BOOL {
    use windows::Win32::Foundation::{BOOL, HWND, LPARAM};
    use windows::Win32::UI::WindowsAndMessaging::FindWindowExW;

    let shell = FindWindowExW(
        hwnd,
        HWND(std::ptr::null_mut()),
        windows::core::w!("SHELLDLL_DefView"),
        None,
    );
    if shell.0 != 0 {
        let workerw = FindWindowExW(
            HWND(std::ptr::null_mut()),
            hwnd,
            windows::core::w!("WorkerW"),
            None,
        );
        if workerw.0 != 0 {
            let target = lparam.0 as *mut HWND;
            *target = workerw;
            return BOOL(0);
        }
    }
    BOOL(1)
}

#[cfg(target_os = "windows")]
unsafe extern "system" fn enum_window_workerw_only(
    hwnd: windows::Win32::Foundation::HWND,
    lparam: windows::Win32::Foundation::LPARAM,
) -> windows::Win32::Foundation::BOOL {
    use windows::Win32::Foundation::{BOOL, HWND, LPARAM};
    use windows::Win32::UI::WindowsAndMessaging::{FindWindowExW, GetClassNameW};

    let mut class = [0u16; 16];
    let len = GetClassNameW(hwnd, &mut class);
    if len == 0 {
        return BOOL(1);
    }
    let name = String::from_utf16_lossy(&class[..len as usize]);
    if name != "WorkerW" {
        return BOOL(1);
    }

    let shell = FindWindowExW(
        hwnd,
        HWND(std::ptr::null_mut()),
        windows::core::w!("SHELLDLL_DefView"),
        None,
    );
    if shell.0 == 0 {
        let target = lparam.0 as *mut HWND;
        if (*target).0 == 0 {
            *target = hwnd;
        }
        return BOOL(0);
    }
    BOOL(1)
}

#[cfg(not(target_os = "windows"))]
#[allow(dead_code)]
pub fn embed_to_desktop(_window: &tauri::WebviewWindow) -> Result<(), String> {
    Ok(())
}
