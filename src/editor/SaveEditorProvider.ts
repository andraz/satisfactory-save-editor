import * as vscode from 'vscode'
import { SaveParser } from '../parser/SaveParser'
import { SaveWriter } from '../parser/SaveWriter'
import { SaveData } from '../parser/types'

/**
 * A custom document implementation for our save files.
 * It holds the parsed JSON data and the original header info.
 */
class SaveDocument implements vscode.CustomDocument {
  constructor(
    public readonly uri: vscode.Uri,
    public saveData: SaveData,
  ) {}

  dispose(): void {
    // No resources to dispose
  }

  getText(): string {
    return JSON.stringify(this.saveData.objects, null, 2)
  }
}

/**
 * The provider for the Satisfactory Save Editor.
 * This class handles opening, saving, and displaying .sav files.
 */
export class SaveEditorProvider implements vscode.CustomTextEditorProvider {
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
   * Called by VS Code when a .sav file is opened.
   * This is the "unpacking" stage.
   */
  public async openCustomDocument(
    uri: vscode.Uri,
  ): Promise<vscode.CustomDocument> {
    const fileData = await vscode.workspace.fs.readFile(uri)
    const parser = new SaveParser(Buffer.from(fileData))

    try {
      const saveData = parser.parse()
      return new SaveDocument(uri, saveData)
    } catch (error: any) {
      console.error(error)
      vscode.window.showErrorMessage(
        `Failed to parse save file: ${error.message}`,
      )
      throw error
    }
  }

  /**
   * Called by VS Code to display the content of the custom document.
   * We provide the stringified JSON here.
   */
  public async resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken,
  ): Promise<void> {
    // The document is a virtual text document with the JSON content.
    // We can set its initial content and language.
    webviewPanel.webview.options = { enableScripts: true }

    // For a text editor provider, we don't need to render HTML.
    // We manage the document's content, and VS Code renders the editor.
  }

  /**
   * Called by VS Code when the user saves the document.
   * This is the "repackaging" stage.
   */
  public async saveCustomDocument(
    document: SaveDocument,
    cancellation: vscode.CancellationToken,
  ): Promise<void> {
    const docText = document.getText()
    let updatedObjects

    try {
      updatedObjects = JSON.parse(docText)
    } catch (e: any) {
      vscode.window.showErrorMessage('Failed to save: Invalid JSON format.')
      return
    }

    const saveData: SaveData = {
      header: document.saveData.header,
      objects: updatedObjects,
    }

    try {
      const writer = new SaveWriter(saveData)
      const newFileContent = writer.write()

      await vscode.workspace.fs.writeFile(document.uri, newFileContent)
    } catch (error: any) {
      console.error(error)
      vscode.window.showErrorMessage(
        `Failed to write save file: ${error.message}`,
      )
      throw error
    }
  }

  private readonly _onDidChangeCustomDocument = new vscode.EventEmitter<
    vscode.CustomDocumentEditEvent<SaveDocument>
  >()
  public readonly onDidChangeCustomDocument =
    this._onDidChangeCustomDocument.event

  public saveCustomDocumentAs(
    document: SaveDocument,
    destination: vscode.Uri,
    cancellation: vscode.CancellationToken,
  ): Thenable<void> {
    throw new Error('Method not implemented.')
  }

  public revertCustomDocument(
    document: SaveDocument,
    cancellation: vscode.CancellationToken,
  ): Thenable<void> {
    throw new Error('Method not implemented.')
  }

  public backupCustomDocument(
    document: SaveDocument,
    context: vscode.CustomDocumentBackupContext,
    cancellation: vscode.CancellationToken,
  ): Thenable<vscode.CustomDocumentBackup> {
    throw new Error('Method not implemented.')
  }
}
