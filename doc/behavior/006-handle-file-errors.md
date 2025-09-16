# BDD-006: Handle File Errors

**Story:** As a user, I want clear feedback when a file cannot be opened or saved, so that I can diagnose the problem.

## Scenario: Attempt to open a non-save file

-   **Given** I execute the "Open Satisfactory Save" command
-   **When** I select a file that is not a valid `.sav` file (e.g., a `.log` file)
-   **Then** a VSCode error notification is displayed, stating the file is not a valid save file
-   **And** no new tree view is opened

## Scenario: Attempt to open a corrupted save file

-   **Given** I execute the "Open Satisfactory Save" command
-   **When** I select a `.sav` file that is corrupted or has an unreadable header
-   **Then** a VSCode error notification is displayed, stating the file could not be parsed
-   **And** the loading process is aborted
