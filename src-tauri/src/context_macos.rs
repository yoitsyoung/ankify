use serde::{Deserialize, Serialize};
use std::process::Command;
use tauri_plugin_clipboard_manager::ClipboardExt;

#[derive(Debug, Serialize, Deserialize)]
pub struct Context {
    pub clipboard: String,
    pub app_name: String,
    pub url: Option<String>,
    pub timestamp: String,
}

#[tauri::command]
pub async fn get_context_macos(app: tauri::AppHandle) -> Result<Context, String> {
    println!("[Rust] get_context_macos called");

    // Get clipboard text
    let clipboard = match app.clipboard().read_text() {
        Ok(text) => {
            println!("[Rust] Clipboard read success: {} chars", text.len());
            println!("[Rust] Clipboard preview: {}", &text.chars().take(50).collect::<String>());
            text
        }
        Err(e) => {
            println!("[Rust] Clipboard read error: {:?}", e);
            String::new()
        }
    };

    // Get active app name using AppleScript
    let app_name = get_active_app_name().unwrap_or_else(|| "Unknown".to_string());
    println!("[Rust] Active app: {}", app_name);

    // Get browser URL if applicable
    let url = if app_name.contains("Safari") {
        let safari_url = get_safari_url();
        println!("[Rust] Safari URL: {:?}", safari_url);
        safari_url
    } else if app_name.contains("Chrome") {
        let chrome_url = get_chrome_url();
        println!("[Rust] Chrome URL: {:?}", chrome_url);
        chrome_url
    } else {
        println!("[Rust] Not a browser app");
        None
    };

    // Get current timestamp
    let timestamp = chrono::Utc::now().to_rfc3339();

    let context = Context {
        clipboard: clipboard.clone(),
        app_name: app_name.clone(),
        url: url.clone(),
        timestamp: timestamp.clone(),
    };

    println!("[Rust] Returning context - clipboard len: {}, app: {}, url: {:?}",
             clipboard.len(), app_name, url);

    Ok(context)
}

fn get_active_app_name() -> Option<String> {
    let script = r#"
        tell application "System Events"
            set frontApp to name of first application process whose frontmost is true
            return frontApp
        end tell
    "#;

    let output = Command::new("osascript")
        .arg("-e")
        .arg(script)
        .output()
        .ok()?;

    if output.status.success() {
        String::from_utf8(output.stdout)
            .ok()
            .map(|s| s.trim().to_string())
    } else {
        None
    }
}

fn get_safari_url() -> Option<String> {
    let script = r#"
        tell application "Safari"
            if (count of windows) > 0 then
                return URL of current tab of front window
            end if
        end tell
    "#;

    let output = Command::new("osascript")
        .arg("-e")
        .arg(script)
        .output()
        .ok()?;

    if output.status.success() {
        String::from_utf8(output.stdout)
            .ok()
            .map(|s| s.trim().to_string())
            .filter(|s| !s.is_empty())
    } else {
        None
    }
}

fn get_chrome_url() -> Option<String> {
    let script = r#"
        tell application "Google Chrome"
            if (count of windows) > 0 then
                return URL of active tab of front window
            end if
        end tell
    "#;

    let output = Command::new("osascript")
        .arg("-e")
        .arg(script)
        .output()
        .ok()?;

    if output.status.success() {
        String::from_utf8(output.stdout)
            .ok()
            .map(|s| s.trim().to_string())
            .filter(|s| !s.is_empty())
    } else {
        None
    }
}
