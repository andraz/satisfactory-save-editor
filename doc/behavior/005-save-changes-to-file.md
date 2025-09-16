# BDD-005: Save Changes to File

**Story:** As a save file editor, I want to save my changes back to the file system, so that my modifications can be loaded in the game.

## Scenario: Successfully save a modified file

-   **Given** I have a save file open in the tree view and have modified a value
-   **When** I execute the "Save Satisfactory File" command
-   **Then** the tree view's structured data is serialized back into the game's binary format
-   **And** the original `.sav` file on disk is updated with the new compressed data
-   **And** a success notification appears in VSCode
