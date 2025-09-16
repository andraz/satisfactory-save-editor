# BDD-001: Display Save File Header

**Story:** As a user, I want to see basic information immediately after opening a save file, so I can verify I've selected the correct one before full processing begins.

## Scenario: Open a valid file and view its header

-   **Given** I execute the "Open Satisfactory Save" command
-   **When** I select a valid `.sav` file
-   **Then** a new tree view opens in the editor
-   **And** the tree view contains a "Header" node
-   **And** expanding the "Header" node shows key-value pairs for "Save Version", "Session Name", and "Play Duration"
