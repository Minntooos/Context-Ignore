# Context Ignore Extension

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
![Version](https://img.shields.io/badge/version-1.0.1-black)
![VS Code](https://img.shields.io/badge/VS%20Code-%E2%89%A51.70-007ACC?logo=visualstudiocode)
![Platform](https://img.shields.io/badge/Platform-Cursor%20%7C%20Windsurf%20%7C%20Qoder%20%7C%20VS%20Code-6C4DFD)

A smart, context-aware extension for VS Code, Cursor, and other forks that radically simplifies managing `.ignore` files.

### Contents
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Keybinding Scheme](#keybinding-scheme)
- [Supported Ignore Files](#supported-ignore-files)
- [Acknowledgments](#acknowledgments)
- [Development](#development)
- [License](#license)

### Features
- **Dynamic Context Menus**: Intelligently shows only relevant ignore options for your specific IDE, be it Cursor, Windsurf (Codeium), Qoder, or plain VS Code with extensions like Cline or Roo Code.
- **Multi-Select Support**: Select multiple files and folders in the explorer and add, remove, or inverse-ignore them all in a single action.
- **Inverse Ignore**: A powerful "ignore everything but this" feature. It adds `*` to the ignore file and then un-ignores your selection, creating an "allow list."
- **Unified, Persistent Undo**: Any ignore operation (add, remove, or inverse-ignore) can be undone with a single command (`Ctrl+Alt+U`), even after reloading the editor.
- **File Watching**: Automatically detects when a supported ignore file (e.g., `.gitignore`) is created or deleted and updates the context menu in real-time.
- **Always Ignore**: Permanently ignore files. Standard "remove" and "inverse ignore" operations will respect these entries, leaving them untouched.
- **Remove Always Ignore**: A dedicated command to remove a permanently ignored entry, available from the context menu and with its own keybinding.

### Installation
1. Open Cursor/VS Code → Extensions view
2. Click the ⋯ menu → "Install from VSIX..."
3. Select `context-ignore-1.0.1.vsix`

### Quick Start
1. Open a workspace/folder.
2. Select files or folders in the Explorer.
3. Right-click and choose the desired ignore operation from the context menu.

### Keybinding Scheme
The extension provides a consistent and conflict-free set of keybindings:
*   **Add to Ignore**: `Ctrl+Alt+<key>` (e.g., `Ctrl+Alt+G` for `.gitignore`)
*   **Remove from Ignore**: `Ctrl+Shift+Alt+<key>` (e.g., `Ctrl+Shift+Alt+G` for `.gitignore`)
*   **Always Ignore**: `Ctrl+Shift+Win+Alt+<key>` (e.g., `Ctrl+Shift+Win+Alt+G` for `.gitignore`)
*   **Remove Always Ignore**: `Ctrl+Shift+Win+Alt+D` (Global keybinding for all ignore files)
*   **Inverse Ignore (Primary)**: `Ctrl+Alt+I` (For the main IDE or active extension like Cursor, Cline, etc.)
*   **Inverse Ignore (.gitignore)**: `Ctrl+Alt+J` (Separate key to avoid conflicts)
*   **Undo Last Ignore Operation**: `Ctrl+Alt+U`

### Supported Ignore Files
The extension currently supports the following ignore files:
*   `.cursorignore`
*   `.clineignore`
*   `.kilocodeignore`
*   `.codeiumignore` (for Windsurf)
*   `.qoderignore`
*   `.rooignore`
*   `.gitignore`

### Acknowledgments
A special thanks to `mahdidevlp` for creating the initial, basic version of this tool which inspired the current extension.

### Development
- `npm ci` to install dependencies.
- `npm run compile` to build.
- Press `F5` in VS Code to run the extension in a new host window.

### License
MIT


