# ADR-003: Type-Based Object Deserialization Registry

**Status:** Accepted

## Context and Problem Statement

The deserialized save file body contains a heterogeneous list of game objects, each identified by a class name string like `/Game/FactoryGame/Buildable/Factory/AssemblerMk1/Build_AssemblerMk1.Build_AssemblerMk1_C`. A monolithic parser with a giant switch-case statement would be brittle and difficult to extend for new game items, mods, or updates.

## Driving Behaviors

- [BDD-003: Display a Single Game Object](../behavior/003-display-a-single-game-object.md)
- [BDD-006: Handle File Errors](../behavior/006-handle-file-errors.md)

## Drivers

- **Extensibility:** Adding support for a new building or item should not require changes to the core deserialization loop.
- **Decoupling:** The core stream-reading logic should be ignorant of the specific properties of a "Miner" versus a "Conveyor Belt".
- **Maintainability:** Logic for parsing a specific object type should be co-located and easy to find.

## Decision

A registry pattern will be used. The system will maintain a map where keys are object class name strings and values are handler functions or classes responsible for parsing the specific binary data for that object type. The main deserializer will read an object's class name, look it up in the registry, and delegate the rest of that object's parsing to the corresponding handler.

## System Impact

- Decouples the file stream parser from the implementation details of individual game objects.
- Adding support for new items is localized to adding a new entry to the registry and its handler.
- The system can gracefully handle unknown objects by simply not having an entry in the registry and skipping that object's data.

## Related ADRs

- Constrained by: [ADR-002: Staged Serialization-Deserialization Pipeline](002-staged-serialization-pipeline.md)
