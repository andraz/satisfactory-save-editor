# BDD-007: Asynchronous Processing Feedback

**Story:** As a user with a large save file, I want to see progress updates during loading and saving, so that I know the extension is working.

## Scenario: Opening or saving a large file

-   **Given** I have initiated an open or save command on a large file
-   **When** the processing begins
-   **Then** a VSCode progress notification appears (e.g., in the bottom-right corner)
-   **And** the notification displays the current stage, such as "Decompressing..." or "Serializing objects..."
-   **And** the VSCode user interface remains fully responsive
