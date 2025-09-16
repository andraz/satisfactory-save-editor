# ADR-001: Off-Thread File Processing

**Status:** Accepted

## Context and Problem Statement

Parsing a large, compressed binary save file is a CPU-intensive operation that can take several seconds. Performing this work on the main extension host thread would block the entire VSCode UI, making the editor unresponsive and providing a poor user experience.

## Driving Behaviors

- [BDD-001: Open Valid Save File](../behavior/001-open-valid-save-file.md)
- [BDD-002: Save Changes to File](../behavior/002-save-changes-to-file.md)
- [BDD-004: Asynchronous Processing Feedback](../behavior/004-asynchronous-processing-feedback.md)

## Drivers

- **UI Responsiveness:** The VSCode editor must remain interactive and usable at all times.
- **Concurrency:** The system must handle heavy background processing without impacting the foreground user experience.

## Decision

All file I/O, decompression, compression, serialization, and deserialization logic will be executed in an off-thread process (e.g., a Web Worker or a separate Node.js child process). The main extension thread will be responsible only for coordinating with the VSCode API, sending the file path to the worker, and receiving structured data or progress updates back.

## System Impact

- Guarantees a non-blocking, responsive UI for the user.
- Clearly separates the data processing logic from the UI presentation logic.
- Requires an explicit message-passing mechanism for communication between the threads.

## Related ADRs

- Enables: [ADR-004: Asynchronous IPC for Progress Reporting](./004-asynchronous-ipc-progress-reporting.md)
