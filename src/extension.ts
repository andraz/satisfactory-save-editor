import * as vscode from 'vscode'
import { SaveEditorProvider } from './editor/SaveEditorProvider'

export function activate(context: vscode.ExtensionContext) {
  console.log('Satisfactory Save Editor is now active!')

  // Register our custom editor provider
  context.subscriptions.push(SaveEditorProvider.register(context))
}

export function deactivate() {}
