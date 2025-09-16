# VSCode Satisfactory Save Editor Documentation

This folder contains the living documentation for the VSCode Satisfactory Save Editor extension. Our methodology ensures that every architectural decision is directly driven by a concrete user need, focusing on providing a responsive and reliable editing experience.

The documentation is split into two primary categories:

1.  **Behaviors (BDDs):** These documents describe _what_ the system must do from a user's perspective. They are organized to provide incremental, testable goals.
2.  **Architectural Decisions (ADRs):** These documents describe _how_ the system is structured to achieve those behaviors.

Crucially, **BDDs drive ADRs**. An architectural decision is only made when it is required to enable a specific, documented behavior.

## Behaviors (BDDs) - The "What"

These behaviors are ordered to create a clear, step-by-step development path. Each BDD represents a small, verifiable slice of functionality.

- **Milestone 1: File Validation & Header Parsing**
  - [BDD-001: Display Save File Header](./behavior/001-display-save-file-header.md)
- **Milestone 2: High-Level Structure Parsing**
  - [BDD-002: Outline Save File Body Structure](./behavior/002-outline-save-file-body-structure.md)
- **Milestone 3: Deep Object Deserialization**
  - [BDD-003: Display a Single Game Object](./behavior/003-display-a-single-game-object.md)
  - [BDD-004: Display All Game Objects](./behavior/004-display-all-game-objects.md)
- **Milestone 4: Saving Changes**
  - [BDD-005: Save Changes to File](./behavior/005-save-changes-to-file.md)
- **Supporting Behaviors**
  - [BDD-006: Handle File Errors](./behavior/006-handle-file-errors.md)
  - [BDD-007: Asynchronous Processing Feedback](./behavior/007-asynchronous-processing-feedback.md)

## Architectural Decisions (ADRs) - The "How"

These documents record the significant, high-level patterns we use to build the extension.

- [ADR-001: Off-Thread File Processing](./architecture/001-off-thread-file-processing.md)
- [ADR-002: Staged Serialization-Deserialization Pipeline](./architecture/002-staged-serialization-pipeline.md)
- [ADR-003: Type-Based Object Deserialization Registry](./architecture/003-object-deserialization-registry.md)
- [ADR-004: Asynchronous IPC for Progress Reporting](./architecture/004-asynchronous-ipc-progress-reporting.md)

## The BDD → ADR Workflow: From Behavior to Blueprint

| When the system needs to... (Behavior)                                                                                                                                                                                      | It raises the architectural question...                                                                     | Which is answered by... (Decision)                                                                            |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| [Open and process files](./behavior/001-display-save-file-header.md) without freezing the editor, while [providing feedback](./behavior/007-asynchronous-processing-feedback.md).                                           | How do we handle long, CPU-intensive file operations without blocking the VSCode UI thread?                 | [ADR-001: Off-Thread File Processing](./architecture/001-off-thread-file-processing.md)                       |
| [Read the file header](./behavior/001-display-save-file-header.md), then [decompress the body](./behavior/002-outline-save-file-body-structure.md), and finally [save it all back](./behavior/005-save-changes-to-file.md). | How do we reliably process the file in distinct, sequential stages for both reading and writing?            | [ADR-002: Staged Serialization-Deserialization Pipeline](./architecture/002-staged-serialization-pipeline.md) |
| [Parse one object type](./behavior/003-display-a-single-game-object.md) and then incrementally add support for all others.                                                                                                  | How can we add support for different object types one-by-one without creating a monolithic, brittle parser? | [ADR-003: Type-Based Object Deserialization Registry](./architecture/003-object-deserialization-registry.md)  |
| [Show real-time progress](./behavior/007-asynchronous-processing-feedback.md) from the background process to the user.                                                                                                      | How does the background parser communicate its progress back to the main UI thread for notifications?       | [ADR-004: Asynchronous IPC for Progress Reporting](./architecture/004-asynchronous-ipc-progress-reporting.md) |
