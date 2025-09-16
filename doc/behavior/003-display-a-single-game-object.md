# BDD-003: Display a Single Game Object

**Story:** As a developer, I need to parse a single, simple game object and see its properties, so I can verify that the core deserialization logic is working correctly.

## Scenario: Expand the "Game Objects" list to see the first object

-   **Given** the tree view shows the high-level body structure, including "Game Objects (X items)"
-   **When** I expand the "Game Objects" node
-   **Then** the first item in the list is displayed as a new, expandable node
-   **And** this node is titled with the object's class name (e.g., "Build_PowerPoleMk1_C")
-   **And** expanding this object node reveals its properties, such as "Transform" and "Properties"
