# Ankify Your Life

A native macOS desktop app that captures Anki flashcards from anywhere using a global hotkey and AI-powered suggestions from Claude.

## Features

- **Global Hotkey**: Press `Cmd+Shift+A` from anywhere to capture a flashcard
- **AI Suggestions**: Automatically generate 2-4 flashcard suggestions using Claude 3.5 Sonnet
- **Context Detection**: Automatically captures:
  - Clipboard text
  - Active application name
  - Browser URL (Safari & Chrome)
  - Timestamp
- **Floating Overlay**: Always-on-top, frameless window that appears instantly
- **Keyboard Shortcuts**: Full keyboard navigation for power users
- **AnkiConnect Integration**: Direct integration with Anki desktop app

## Prerequisites

1. **macOS** (this MVP is macOS-only)
2. **Rust** - [Install Rust](https://www.rust-lang.org/tools/install)
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```
3. **Node.js 18+** - [Download Node.js](https://nodejs.org/)
4. **Xcode Command Line Tools**
   ```bash
   xcode-select --install
   ```
5. **Anki Desktop** - [Download Anki](https://apps.ankiweb.net/)
6. **AnkiConnect Add-on** - In Anki: Tools → Add-ons → Get Add-ons → Code: `2055492159`
7. **Anthropic API Key** - [Get your key](https://console.anthropic.com/)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API Key

```bash
cp .env.example .env
```

Edit `.env` and add your Anthropic API key:
```
VITE_ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### 3. Grant Permissions

On first run, macOS will request:
- **Accessibility** permissions (for global hotkey and AppleScript)
- **Screen Recording** permissions (for context detection)

Grant these in: System Settings → Privacy & Security → Accessibility/Screen Recording

## Running the App

### Development Mode

```bash
npm run tauri dev
```

This starts the app in development mode with hot-reload enabled.

### Build for Production

```bash
npm run tauri build
```

The built app will be in `src-tauri/target/release/bundle/macos/Ankify.app`

## Usage

### Quick Start

1. **Start Anki** - Ensure Anki is running before using the app
2. **Copy text** - Copy any text you want to turn into a flashcard
3. **Press `Cmd+Shift+A`** - The floating window appears
4. **Wait for AI suggestions** - Claude generates 2-4 flashcard suggestions
5. **Click a suggestion** or edit manually - Front/Back fields are editable
6. **Press `Cmd+Enter`** or click "Add to Anki" - Card is saved to Anki
7. **Done!** - The window closes automatically

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+Shift+A` | Open capture window (works globally) |
| `Cmd+Enter` | Submit card to Anki |
| `Escape` | Close window without saving |
| `Cmd+1/2/3` | Use AI suggestion 1/2/3 |
| `Tab` | Navigate between fields |

## Troubleshooting

### "Cannot connect to Anki"

- Ensure Anki is running
- Verify AnkiConnect is installed: Anki → Tools → Add-ons → Check for "AnkiConnect"
- Restart Anki if you just installed AnkiConnect

### Global Hotkey Not Working

- Grant Accessibility permissions: System Settings → Privacy & Security → Accessibility → Enable "Ankify"
- Restart the app after granting permissions

### Browser URL Not Detected

- Grant Accessibility permissions (AppleScript needs it)
- Only Safari and Chrome are supported
- Private/Incognito windows may block AppleScript access

### AI Suggestions Not Appearing

- Check your `.env` file has a valid `VITE_ANTHROPIC_API_KEY`
- Ensure clipboard text is at least 10 characters long
- Check browser console (in dev mode) for API errors
- Verify you have API credits in your Anthropic account

## Architecture

### Project Structure

```
ankify/
├── src/                          # Frontend (React + TypeScript)
│   ├── components/
│   │   ├── CardForm.tsx         # Main form component
│   │   ├── SuggestionsList.tsx  # AI suggestions UI
│   │   └── ContextDisplay.tsx   # Context metadata display
│   ├── hooks/
│   │   └── useLLMSuggestions.ts # React hook for Claude API
│   ├── services/
│   │   ├── llm-agent.ts         # Anthropic Claude integration
│   │   └── anki.ts              # AnkiConnect API client
│   ├── types/
│   │   └── index.ts             # TypeScript types
│   └── App.tsx                  # Root component
└── src-tauri/                    # Backend (Rust + Tauri)
    ├── src/
    │   ├── main.rs              # Entry point
    │   ├── lib.rs               # Tauri app setup + global hotkey
    │   └── context_macos.rs     # macOS context detection
    ├── Cargo.toml               # Rust dependencies
    └── tauri.conf.json          # Tauri configuration
```

## License

MIT License

---

**Happy learning!** 🎓✨
