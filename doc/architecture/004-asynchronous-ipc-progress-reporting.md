# ADR-004: Asynchronous IPC for Progress Reporting

**Status:** Accepted

## Context and Problem Statement

Because all file processing happens off-thread, the main extension process needs a way to receive status updates to display progress to the user through the VSCode notification API. Direct function calls are not possible across these process boundaries.

## Driving Behaviors

- [BDD-007: Asynchronous Processing Feedback](../behavior/007-asynchronous-processing-feedback.md)

## Drivers

- **Decoupling:** The file-processing worker must not have any knowledge of or dependency on the `vscode` API.
- **Structured Communication:** Progress updates must be sent in a consistent and predictable format.

## Decision

The system will use a message-passing interface for communication. The off-thread worker will post messages with a standardized object structure, such as `{ type: 'progress', data: { value: 25, message: 'Decompressing file...' } }` or `{ type: 'complete', data: { ...structuredSaveData } }`. The main extension thread will listen for these messages and translate them into calls to the `vscode.window.withProgress` API.

## System Impact

- Maintains a strong separation between the core logic and the editor-specific presentation layer.
- Creates a simple, testable communication API between the two processes.
- All data passed between processes must be serializable, which restricts the types of information that can be exchanged.

## Related ADRs

- Builds on: [ADR-001: Off-Thread File Processing](001-off-thread-file-processing.md)
