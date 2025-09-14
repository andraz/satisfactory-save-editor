import * as vscode from 'vscode'
import { SaveParser } from '../parser/SaveParser'
import { SaveWriter } from '../parser/SaveWriter'
import { SaveData } from '../parser/types'

/**
 * The Custom Document for our save files. It holds the parsed data.
 */
class SaveDocument implements vscode.CustomDocument {
  constructor(
    public readonly uri: vscode.Uri,
    public saveData: SaveData,
  ) {}
  dispose(): void {}
}

/**
 * The provider for the Satisfactory Save Editor.
 * This class implements the CustomEditorProvider API, which is ideal for binary files.
 */
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

  constructor(private readonly context: vscode.ExtensionContext) {}

  /**
   * Called by VS Code when a .sav file is opened. This is the "unpacking" stage.
   */
  public async openCustomDocument(uri: vscode.Uri): Promise<SaveDocument> {
    const fileData = await vscode.workspace.fs.readFile(uri)
    const parser = new SaveParser(Buffer.from(fileData))
    const saveData = parser.parse()
    return new SaveDocument(uri, saveData)
  }

  /**
   * Called by VS Code to render the editor for our custom document.
   */
  public async resolveCustomEditor(
    document: SaveDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken,
  ): Promise<void> {
    webviewPanel.webview.options = { enableScripts: true }
    webviewPanel.webview.html = this._getWebviewContent(document.saveData)

    // Handle messages from the webview (e.g., when content changes)
    webviewPanel.webview.onDidReceiveMessage((message) => {
      switch (message.command) {
        case 'update':
          try {
            const updatedObjects = JSON.parse(message.text)
            document.saveData.objects = updatedObjects
            this._onDidChangeCustomDocument.fire({
              document,
              undo: () => {},
              redo: () => {},
            })
          } catch (e) {
            // Ignore JSON syntax errors during typing
          }
          return
      }
    })
  }

  /**
   * Generates the HTML for the editor, placing the JSON in a textarea.
   */
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
                        margin: 0;
                        padding: 0;
                        width: 100%;
                        height: 100vh;
                        border: none;
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
                        vscode.postMessage({
                            command: 'update',
                            text: e.target.value
                        });
                    });
                </script>
            </body>
            </html>`
  }

  // These events are required for the "save" functionality to work.
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
    // Implement "Save As" logic here
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
    // Fire an event to tell VS Code the document has changed
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
