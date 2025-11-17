use serde::{Deserialize, Serialize};
use std::process::Command;

#[derive(Debug, Serialize, Deserialize)]
pub struct Context {
    pub clipboard: String,
    pub app_name: String,
    pub url: Option<String>,
    pub timestamp: String,
}

#[tauri::command]
pub async fn get_context_macos(app: tauri::AppHandle) -> Result<Context, String> {
    // Get clipboard text
    let clipboard = match app.clipboard().read_text() {
        Ok(text) => text.unwrap_or_default(),
        Err(_) => String::new(),
    };

    // Get active app name using AppleScript
    let app_name = get_active_app_name().unwrap_or_else(|| "Unknown".to_string());

    // Get browser URL if applicable
    let url = if app_name.contains("Safari") {
        get_safari_url()
    } else if app_name.contains("Chrome") {
        get_chrome_url()
    } else {
        None
    };

    // Get current timestamp
    let timestamp = chrono::Utc::now().to_rfc3339();

    Ok(Context {
        clipboard,
        app_name,
        url,
        timestamp,
    })
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
