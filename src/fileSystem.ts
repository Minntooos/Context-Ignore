import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { IgnoreOperation } from "./state";
import { ALWAYS_IGNORE_MARKER } from "./constants";

function addUnignoreEntries(lines: string[], rel: string): void {
    const cleanRel = rel.endsWith("/") ? rel.slice(0, -1) : rel;
    const parts = cleanRel.split("/");
    if (parts.length > 1) {
        for (let i = 1; i < parts.length; i++) {
            const parentPath = `!${parts.slice(0, i).join("/")}`;
            if (!lines.includes(parentPath)) {
                lines.push(parentPath);
            }
        }
    }
    const selfPath = `!${cleanRel}`;
    if (!lines.includes(selfPath)) {
        lines.push(selfPath);
    }
}

function getRelativePath(root: string, fsPath: string): string {
    const relRaw = path.relative(root, fsPath);
    const rel = relRaw.replace(/\\/g, "/");
    try {
        if (fs.statSync(fsPath).isDirectory()) {
            return rel + "/";
        }
    } catch (e) {
        // May fail if path refers to a file that does not exist.
    }
    return rel;
}

function getRootToUrisMap(uris: vscode.Uri[]): Map<string, vscode.Uri[]> {
    const rootToUris = new Map<string, vscode.Uri[]>();
    for (const uri of uris) {
        const folder = vscode.workspace.getWorkspaceFolder(uri);
        if (!folder) {
            continue;
        }
        const root = folder.uri.fsPath;
        const list = rootToUris.get(root) ?? [];
        list.push(uri);
        rootToUris.set(root, list);
    }
    return rootToUris;
}

export function performIgnoreOperation(
    ignoreFileName: string,
    inputUris: vscode.Uri[],
    remove: boolean
): IgnoreOperation[] | null {
    const resolvedUris: vscode.Uri[] = (inputUris ?? []).filter((u): u is vscode.Uri => Boolean(u));
    if (resolvedUris.length === 0) {
        vscode.window.showErrorMessage(`No selection detected. Use from Explorer context menu or open a file.`);
        return null;
    }

    const rootToUris = getRootToUrisMap(resolvedUris);
    if (rootToUris.size === 0) {
        vscode.window.showErrorMessage(`No workspace folder found for selected items.`);
        return null;
    }

    const operations: IgnoreOperation[] = [];
    for (const [root, uris] of rootToUris) {
        const ignorePath = path.join(root, ignoreFileName);
        let originalContent = "";
        if (fs.existsSync(ignorePath)) {
            originalContent = fs.readFileSync(ignorePath, "utf8");
        }
        operations.push({ filePath: ignorePath, content: originalContent });

        let lines = originalContent.split("\n").map((l) => l.trim()).filter((l) => l !== "");

        const isInverse = lines.includes('*');

        for (const uri of uris) {
            const rel = getRelativePath(root, uri.fsPath);
            if (remove) {
                if (isInverse) {
                    addUnignoreEntries(lines, rel);
                } else {
                    const indexToRemove = lines.findIndex(l => l.trim() === rel);
                    if (indexToRemove !== -1) {
                        const isAlways = indexToRemove > 0 && lines[indexToRemove - 1].trim().endsWith(ALWAYS_IGNORE_MARKER);
                        if (isAlways) {
                            vscode.window.showInformationMessage(`"${rel}" is permanently ignored. Use the dedicated command to remove it.`);
                        } else {
                            lines.splice(indexToRemove, 1);
                        }
                    }
                }
            } else if (!lines.some(l => l.trim() === rel)) {
                lines.push(rel);
            }
        }
        fs.writeFileSync(ignorePath, lines.join("\n") + "\n");
    }
    return operations;
}

export function performInverseIgnoreOperation(
    ignoreFileName: string,
    inputUris: vscode.Uri[]
): IgnoreOperation[] | null {
    const resolvedUris: vscode.Uri[] = (inputUris ?? []).filter((u): u is vscode.Uri => Boolean(u));
    if (resolvedUris.length === 0) {
        vscode.window.showErrorMessage(`No selection detected. Use from Explorer context menu or open a file.`);
        return null;
    }

    const rootToUris = getRootToUrisMap(resolvedUris);
    if (rootToUris.size === 0) {
        vscode.window.showErrorMessage(`No workspace folder found for selected items.`);
        return null;
    }

    const operations: IgnoreOperation[] = [];
    for (const [root, uris] of rootToUris) {
        const ignorePath = path.join(root, ignoreFileName);
        let originalContent = "";
        if (fs.existsSync(ignorePath)) {
            originalContent = fs.readFileSync(ignorePath, "utf8");
        }
        operations.push({ filePath: ignorePath, content: originalContent });

        const originalLines = originalContent.split("\n");
        const alwaysIgnoreBlocks = [];
        for (let i = 0; i < originalLines.length; i++) {
            if (originalLines[i].includes(ALWAYS_IGNORE_MARKER)) {
                alwaysIgnoreBlocks.push(originalLines[i]);
                if (i + 1 < originalLines.length) {
                    alwaysIgnoreBlocks.push(originalLines[i+1]);
                    i++; 
                }
            }
        }
        
        const lines: string[] = [...alwaysIgnoreBlocks, "*"];
        for (const uri of uris) {
            const rel = getRelativePath(root, uri.fsPath);
            addUnignoreEntries(lines, rel);
        }
        fs.writeFileSync(ignorePath, lines.join("\n") + "\n");
    }
    return operations;
}

export function removeAlwaysIgnoreEntry(
    ignoreFileName: string,
    inputUris: vscode.Uri[]
): boolean {
    const resolvedUris: vscode.Uri[] = (inputUris ?? []).filter((u): u is vscode.Uri => Boolean(u));
    if (resolvedUris.length === 0) {
        vscode.window.showErrorMessage(`No selection detected. Use from Explorer context menu or open a file.`);
        return false;
    }

    const rootToUris = getRootToUrisMap(resolvedUris);
    if (rootToUris.size === 0) {
        vscode.window.showErrorMessage(`No workspace folder found for selected items.`);
        return false;
    }

    let changed = false;
    for (const [root, uris] of rootToUris) {
        const ignorePath = path.join(root, ignoreFileName);
        if (!fs.existsSync(ignorePath)) {
            continue;
        }

        let lines: string[] = fs.readFileSync(ignorePath, "utf8").split("\n");

        for (const uri of uris) {
            const rel = getRelativePath(root, uri.fsPath);

            const indexToRemove = lines.findIndex(l => l.trim() === rel);

            if (indexToRemove > 0 && lines[indexToRemove - 1].trim().endsWith(ALWAYS_IGNORE_MARKER)) {
                lines.splice(indexToRemove - 1, 2); // Remove marker and the line
                changed = true;
            }
        }
        fs.writeFileSync(ignorePath, lines.join("\n"));
    }
    return changed;
}

export function addAlwaysIgnoreEntry(
    ignoreFileName: string,
    inputUris: vscode.Uri[]
): boolean {
    const resolvedUris: vscode.Uri[] = (inputUris ?? []).filter((u): u is vscode.Uri => Boolean(u));
    if (resolvedUris.length === 0) {
        vscode.window.showErrorMessage(`No selection detected. Use from Explorer context menu or open a file.`);
        return false;
    }

    const rootToUris = getRootToUrisMap(resolvedUris);
    if (rootToUris.size === 0) {
        vscode.window.showErrorMessage(`No workspace folder found for selected items.`);
        return false;
    }

    for (const [root, uris] of rootToUris) {
        const ignorePath = path.join(root, ignoreFileName);
        let lines: string[] = [];
        if (fs.existsSync(ignorePath)) {
            lines = fs.readFileSync(ignorePath, "utf8").split("\n").filter(l => l.trim() !== '');
        }

        for (const uri of uris) {
            const rel = getRelativePath(root, uri.fsPath);
            
            let foundIndex = -1;
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].trim() === rel) {
                    foundIndex = i;
                    break;
                }
            }

            if (foundIndex !== -1) {
                if (foundIndex === 0 || !lines[foundIndex - 1].includes(ALWAYS_IGNORE_MARKER)) {
                    lines.splice(foundIndex, 0, ALWAYS_IGNORE_MARKER);
                }
            } else {
                lines.push(ALWAYS_IGNORE_MARKER);
                lines.push(rel);
            }
        }
        fs.writeFileSync(ignorePath, lines.join("\n") + "\n");
    }
    return true;
}

export function restoreFileContent(ops: IgnoreOperation[]) {
    for (const op of ops) {
        fs.writeFileSync(op.filePath, op.content);
    }
}


