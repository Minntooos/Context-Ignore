import * as vscode from "vscode";

export async function getSelection(uri?: vscode.Uri, uris?: vscode.Uri[]): Promise<vscode.Uri[]> {
  if (uris && uris.length > 1) {
    return uris;
  }

  const activeEditorUri = vscode.window.activeTextEditor?.document.uri;
  if (activeEditorUri && uri && activeEditorUri.fsPath === uri.fsPath) {
    return uri ? [uri] : [];
  }

  try {
    const originalClipboard = await vscode.env.clipboard.readText();
    await vscode.commands.executeCommand('copyFilePath');
    const clipboardContent = await vscode.env.clipboard.readText();
    await vscode.env.clipboard.writeText(originalClipboard);

    if (clipboardContent && clipboardContent !== originalClipboard) {
      const paths = clipboardContent.split(/\r\n|\r|\n/).map(p => p.trim()).filter(Boolean);
      if (paths.length > 0) {
        return paths.map(p => vscode.Uri.file(p));
      }
    }
  } catch (e) {
    console.error("Context Ignore: Clipboard hack failed.", e);
  }

  return uris ?? (uri ? [uri] : []);
}
