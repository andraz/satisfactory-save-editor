// src/editor/SaveEditorProvider.ts

import * as vscode from 'vscode'
import { SaveParser } from '../parser/SaveParser'
import { SaveWriter } from '../parser/SaveWriter'
import { SaveData } from '../parser/types'

class SaveDocument implements vscode.CustomDocument {
  constructor(
    public readonly uri: vscode.Uri,
    public saveData: SaveData,
  ) {}
  dispose(): void {}
}

export class SaveEditorProvider
  implements vscode.CustomEditorProvider<SaveDocument>
{
  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    const provider = new SaveEditorProvider(context)
    return vscode.window.registerCustomEditorProvider(
      SaveEditorProvider.viewType,
      provider,
    )
  }

  private static readonly viewType = 'satisfactory.saveEditor'

  /** A map to link a document URI to its corresponding webview panel. */
  private readonly webviewPanelMap = new Map<string, vscode.WebviewPanel>()

  constructor(private readonly context: vscode.ExtensionContext) {}

  public async openCustomDocument(uri: vscode.Uri): Promise<SaveDocument> {
    const fileData = await vscode.workspace.fs.readFile(uri)
    const parser = new SaveParser(Buffer.from(fileData))
    const saveData = parser.parse()
    return new SaveDocument(uri, saveData)
  }

  public async resolveCustomEditor(
    document: SaveDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken,
  ): Promise<void> {
    this.webviewPanelMap.set(document.uri.toString(), webviewPanel)

    webviewPanel.webview.options = { enableScripts: true }
    webviewPanel.webview.html = this._getWebviewContent(document.saveData)

    webviewPanel.webview.onDidReceiveMessage((message) => {
      if (message.command === 'update') {
        try {
          document.saveData.objects = JSON.parse(message.text)
          this._onDidChangeCustomDocument.fire({
            document,
            undo: () => {},
            redo: () => {},
          })
        } catch (e) {
          // Ignore transient JSON errors
        }
      }
    })
  }

  private _getWebviewContent(saveData: SaveData): string {
    const jsonString = JSON.stringify(saveData.objects, null, 2)
    return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Satisfactory Save Editor</title>
                <style>
                    body, html, textarea {
                        margin: 0; padding: 0; width: 100%; height: 100vh;
                        border: none; box-sizing: border-box;
                        font-family: var(--vscode-editor-font-family);
                        font-size: var(--vscode-editor-font-size);
                        background-color: var(--vscode-editor-background);
                        color: var(--vscode-editor-foreground);
                    }
                </style>
            </head>
            <body>
                <textarea id="editor">${jsonString}</textarea>
                <script>
                    const vscode = acquireVsCodeApi();
                    const editor = document.getElementById('editor');
                    
                    editor.addEventListener('input', (e) => {
                        vscode.postMessage({ command: 'update', text: e.target.value });
                    });
                </script>
            </body>
            </html>`
  }

  private readonly _onDidChangeCustomDocument = new vscode.EventEmitter<
    vscode.CustomDocumentEditEvent<SaveDocument>
  >()
  public readonly onDidChangeCustomDocument =
    this._onDidChangeCustomDocument.event

  public async saveCustomDocument(
    document: SaveDocument,
    cancellation: vscode.CancellationToken,
  ): Promise<void> {
    const writer = new SaveWriter(document.saveData)
    const newFileContent = writer.write()
    await vscode.workspace.fs.writeFile(document.uri, newFileContent)
  }

  public async saveCustomDocumentAs(
    document: SaveDocument,
    destination: vscode.Uri,
    cancellation: vscode.CancellationToken,
  ): Promise<void> {
    const writer = new SaveWriter(document.saveData)
    const newFileContent = writer.write()
    await vscode.workspace.fs.writeFile(destination, newFileContent)
  }

  public async revertCustomDocument(
    document: SaveDocument,
    cancellation: vscode.CancellationToken,
  ): Promise<void> {
    const fileData = await vscode.workspace.fs.readFile(document.uri)
    const parser = new SaveParser(Buffer.from(fileData))
    document.saveData = parser.parse()

    const webviewPanel = this.webviewPanelMap.get(document.uri.toString())
    if (webviewPanel) {
      webviewPanel.webview.html = this._getWebviewContent(document.saveData)
    }

    this._onDidChangeCustomDocument.fire({
      document,
      undo: () => {},
      redo: () => {},
    })
  }

  public backupCustomDocument(
    document: SaveDocument,
    context: vscode.CustomDocumentBackupContext,
    cancellation: vscode.CancellationToken,
  ): Thenable<vscode.CustomDocumentBackup> {
    throw new Error('Method not implemented.')
  }
}
