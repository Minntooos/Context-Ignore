import * as vscode from "vscode";
import { SUPPORTED_IGNORE_FILES } from "./constants";
import { updateContextKeys } from "./context";
import { registerCommands } from "./commands";
import { initializeUndoContext } from "./state";

export function activate(context: vscode.ExtensionContext) {
  initializeUndoContext(context);
  updateContextKeys();

  const watcher = vscode.workspace.createFileSystemWatcher(`**/{${SUPPORTED_IGNORE_FILES.join(',')}}`);
  watcher.onDidCreate(updateContextKeys);
  watcher.onDidDelete(updateContextKeys);
  context.subscriptions.push(watcher);

  registerCommands(context);
}

export function deactivate() {}
