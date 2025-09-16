# BDD-002: Outline Save File Body Structure

**Story:** As a user, after seeing the header, I want to see a high-level summary of the file's contents, so I can understand its complexity before all objects are parsed.

## Scenario: Decompress and count top-level components

-   **Given** a valid save file has its header displayed in the tree view
-   **When** the main body of the file is decompressed and scanned
-   **Then** the tree view is updated with new top-level nodes such as "Game Objects" and "Collected Items"
-   **And** each new node displays a count of the items it contains (e.g., "Game Objects (15,243 items)")
-   **And** the items within these nodes are not yet displayed
