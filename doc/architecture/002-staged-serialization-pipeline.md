# ADR-002: Staged Serialization-Deserialization Pipeline

**Status:** Accepted

## Context and Problem Statement

The extension must be able to both read a Satisfactory save file into a structured tree and write that tree back into a valid, game-loadable file. This requires a perfectly mirrored process for data transformation.

## Driving Behaviors

- [BDD-001: Display Save File Header](../behavior/001-display-save-file-header.md)
- [BDD-002: Outline Save File Body Structure](../behavior/002-outline-save-file-body-structure.md)
- [BDD-005: Save Changes to File](../behavior/005-save-changes-to-file.md)

## Drivers

- **Data Integrity:** The process of reading and then writing a file without changes must result in a byte-for-byte identical file.
- **Maintainability:** The logic for reading and writing should be symmetric and easy to manage, reducing the chance of bugs where saving does not correctly invert the opening process.

## Decision

The system will implement a strict, staged, bidirectional pipeline:

1.  **Read Path (Deserialization):**
    - Read file header.
    - Decompress file body using a zlib-compatible library.
    - Deserialize the binary object stream into a structured tree model.
2.  **Write Path (Serialization):**
    - Serialize the structured tree model back into a binary object stream.
    - Compress the binary stream using the same zlib-compatible library.
    - Prepend the file header and write the final binary data to disk.

## System Impact

- Ensures that the save/load process is robust and reversible.
- Creates a clear, testable workflow for file manipulation.
- Any change to the deserialization logic must be mirrored in the serialization logic, increasing development overhead but ensuring consistency.

## Related ADRs

- Builds on: [ADR-001: Off-Thread File Processing](001-off-thread-file-processing.md)
