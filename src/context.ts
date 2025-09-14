import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { SUPPORTED_IGNORE_FILES } from "./constants";

export async function updateContextKeys() {
  console.log("Context Ignore: Running updateContextKeys...");

  const filesFound = new Set<string>();
  const workspaceFolders = vscode.workspace.workspaceFolders;

  // IDE Detection
  const appName = vscode.env.appName;
  console.log(`Context Ignore: Detected IDE: ${appName}`);
  const isCursor = appName.includes('Cursor');
  vscode.commands.executeCommand('setContext', 'contextignore.ide.isCursor', isCursor);
  const isWindsurf = appName.includes('Windsurf') || appName.includes('Codeium');
  vscode.commands.executeCommand('setContext', 'contextignore.ide.isWindsurf', isWindsurf);
  const isQoder = appName.includes('Qoder');
  vscode.commands.executeCommand('setContext', 'contextignore.ide.isQoder', isQoder);

  // Extension Detection
  const cline = vscode.extensions.getExtension('saoudrizwan.claude-dev');
  vscode.commands.executeCommand('setContext', 'contextignore.ext.hasCline', !!cline);
  const kilo = vscode.extensions.getExtension('kilocode.kilo-code');
  vscode.commands.executeCommand('setContext', 'contextignore.ext.hasKilo', !!kilo);
  const roo = vscode.extensions.getExtension('RooVeterinaryInc.roo-cline');
  vscode.commands.executeCommand('setContext', 'contextignore.ext.hasRoo', !!roo);

  if (workspaceFolders) {
    for (const folder of workspaceFolders) {
      const root = folder.uri.fsPath;
      console.log(`Context Ignore: Checking folder: ${root}`);
      for (const file of SUPPORTED_IGNORE_FILES) {
        const filePath = path.join(root, file);
        const hasFile = fs.existsSync(filePath);
        if (hasFile) {
          console.log(`Context Ignore: Found ${file}`);
          filesFound.add(file);
        }
      }
    }
  } else {
    console.log("Context Ignore: No workspace folders found.");
  }

  for (const file of SUPPORTED_IGNORE_FILES) {
    const hasFile = filesFound.has(file);
    const contextKey = `contextignore.has.${file.substring(1)}`;
    console.log(`Context Ignore: Setting context key '${contextKey}' to '${hasFile}'`);
    vscode.commands.executeCommand('setContext', contextKey, hasFile);
  }
}
