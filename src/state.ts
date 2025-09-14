import * as vscode from 'vscode';

export interface IgnoreOperation {
    filePath: string;
    content: string;
}

export async function saveLastOperation(context: vscode.ExtensionContext, ops: IgnoreOperation[]) {
    await context.workspaceState.update("lastIgnoreState", ops);
    await vscode.commands.executeCommand("setContext", "contextignore.canUndo", true);
}

export function getLastOperation(context: vscode.ExtensionContext): IgnoreOperation[] | undefined {
    return context.workspaceState.get("lastIgnoreState");
}

export async function clearLastOperation(context: vscode.ExtensionContext) {
    await context.workspaceState.update("lastIgnoreState", undefined);
    await vscode.commands.executeCommand("setContext", "contextignore.canUndo", false);
}

export function initializeUndoContext(context: vscode.ExtensionContext) {
    const persistentUndoState = getLastOperation(context);
    if (persistentUndoState) {
        vscode.commands.executeCommand("setContext", "contextignore.canUndo", true);
    } else {
        vscode.commands.executeCommand("setContext", "contextignore.canUndo", false);
    }
}
