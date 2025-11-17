mod context_macos;

use tauri::Manager;
use tauri_plugin_global_shortcut::{GlobalShortcutExt, ShortcutState};

#[tauri::command]
fn show_window(app: tauri::AppHandle) -> Result<(), String> {
    println!("[Rust] show_window called");
    if let Some(window) = app.get_webview_window("main") {
        window.show().map_err(|e| e.to_string())?;
        window.set_focus().map_err(|e| e.to_string())?;
        println!("[Rust] Window shown and focused");
    } else {
        println!("[Rust] ERROR: Window 'main' not found");
    }
    Ok(())
}

#[tauri::command]
fn hide_window(app: tauri::AppHandle) -> Result<(), String> {
    println!("[Rust] hide_window called");
    if let Some(window) = app.get_webview_window("main") {
        window.hide().map_err(|e| e.to_string())?;
        println!("[Rust] Window hidden");
    }
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(|app, shortcut, event| {
                    println!("[Rust] Global shortcut triggered: {:?}, state: {:?}", shortcut, event.state);
                    if event.state == ShortcutState::Pressed {
                        if let Some(window) = app.get_webview_window("main") {
                            println!("[Rust] Showing window from global shortcut");
                            let _ = window.show();
                            let _ = window.set_focus();
                        } else {
                            println!("[Rust] ERROR: Window not found in shortcut handler");
                        }
                    }
                })
                .build(),
        )
        .setup(|app| {
            // Register global hotkey: Cmd+Shift+A
            let shortcut = "CmdOrCtrl+Shift+A";
            println!("[Rust] Registering global shortcut: {}", shortcut);
            app.global_shortcut().register(shortcut)?;
            println!("[Rust] Global shortcut registered successfully");

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            show_window,
            hide_window,
            context_macos::get_context_macos
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
