# BDD-004: Display All Game Objects

**Story:** As a user, I want to browse all the objects in my save file, so I can inspect and edit my entire factory.

## Scenario: Fully parse and display all objects in the tree view

-   **Given** the system can correctly parse a single game object
-   **When** the full deserialization process is run on the "Game Objects" list
-   **Then** all items under the "Game Objects" node are displayed as individual, expandable object nodes
-   **And** each object node can be expanded to view its specific properties
