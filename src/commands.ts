import * as vscode from 'vscode';
import { SUPPORTED_IGNORE_FILES } from './constants';
import { getSelection } from './utils';
import { performIgnoreOperation, performInverseIgnoreOperation, restoreFileContent, addAlwaysIgnoreEntry, removeAlwaysIgnoreEntry } from './fileSystem';
import { saveLastOperation, getLastOperation, clearLastOperation } from './state';

async function handleIgnoreOperation(
    context: vscode.ExtensionContext,
    ignoreFileName: string,
    uri: vscode.Uri | undefined,
    uris: vscode.Uri[] | undefined,
    remove: boolean
) {
    const selection = await getSelection(uri, uris);
    const ops = performIgnoreOperation(ignoreFileName, selection, remove);
    if (ops) {
        await saveLastOperation(context, ops);
        vscode.window.showInformationMessage(
            `${remove ? "Removed from" : "Added to"} ${ignoreFileName}. You can undo with Ctrl+Alt+U.`
        );
    }
}

async function handleInverseIgnoreOperation(
    context: vscode.ExtensionContext,
    ignoreFileName: string,
    uri: vscode.Uri | undefined,
    uris: vscode.Uri[] | undefined
) {
    const selection = await getSelection(uri, uris);
    const ops = performInverseIgnoreOperation(ignoreFileName, selection);
    if (ops) {
        await saveLastOperation(context, ops);
        vscode.window.showInformationMessage(`Inversely updated ${ignoreFileName}. You can undo with Ctrl+Alt+U.`);
    }
}

async function handleAddAlwaysIgnore(
    ignoreFileName: string,
    uri: vscode.Uri | undefined,
    uris: vscode.Uri[] | undefined
) {
    const selection = await getSelection(uri, uris);
    const success = addAlwaysIgnoreEntry(ignoreFileName, selection);
    if (success) {
        vscode.window.showInformationMessage(`Permanently added to ${ignoreFileName}. This operation cannot be undone.`);
    }
}

async function handleRemoveAlwaysIgnore(
    ignoreFileName: string,
    uri: vscode.Uri | undefined,
    uris: vscode.Uri[] | undefined
) {
    const selection = await getSelection(uri, uris);
    const success = removeAlwaysIgnoreEntry(ignoreFileName, selection);
    if (success) {
        vscode.window.showInformationMessage(`Removed "Always Ignore" from ${ignoreFileName}.`);
    }
}

async function handleUndoOperation(context: vscode.ExtensionContext) {
    const lastIgnoreState = getLastOperation(context);
    if (lastIgnoreState && lastIgnoreState.length > 0) {
        restoreFileContent(lastIgnoreState);
        vscode.window.showInformationMessage(`Reverted the last ignore operation.`);
        await clearLastOperation(context);
    } else {
        vscode.window.showInformationMessage(`Nothing to undo.`);
    }
}

export function registerCommands(context: vscode.ExtensionContext) {
    for (const file of SUPPORTED_IGNORE_FILES) {
        const fileName = file.substring(1);
        context.subscriptions.push(
            vscode.commands.registerCommand(`contextignore.add.${fileName}`, (uri?: vscode.Uri, uris?: vscode.Uri[]) => {
                handleIgnoreOperation(context, file, uri, uris, false);
            }),
            vscode.commands.registerCommand(`contextignore.remove.${fileName}`, (uri?: vscode.Uri, uris?: vscode.Uri[]) => {
                handleIgnoreOperation(context, file, uri, uris, true);
            }),
            vscode.commands.registerCommand(`contextignore.inverse.${fileName}`, (uri?: vscode.Uri, uris?: vscode.Uri[]) => {
                handleInverseIgnoreOperation(context, file, uri, uris);
            }),
            vscode.commands.registerCommand(`contextignore.addAlways.${fileName}`, (uri?: vscode.Uri, uris?: vscode.Uri[]) => {
                handleAddAlwaysIgnore(file, uri, uris);
            }),
            vscode.commands.registerCommand(`contextignore.removeAlways.${fileName}`, (uri?: vscode.Uri, uris?: vscode.Uri[]) => {
                handleRemoveAlwaysIgnore(file, uri, uris);
            })
        );
    }

    context.subscriptions.push(
        vscode.commands.registerCommand("contextignore.undo", () => handleUndoOperation(context))
    );
}
