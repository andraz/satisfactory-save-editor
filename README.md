# Satisfactory Save Editor for VS Code

![License](https://img.shields.io/github/license/andraz/satisfactory-save-editor)

An experimental VS Code extension to decompress, deserialize, and edit Satisfactory `.sav` files as human-readable JSON, and then repackage them on save.

**⚠️ WARNING: This is an experimental tool. Always back up your save files before editing! Editing the save file can easily corrupt it.**

## Features

- Open `.sav` files directly in VS Code.
- View the entire save game structure as a pretty-printed JSON.
- Edit values and save them back to the binary `.sav` format.

## Requirements

- Visual Studio Code v1.xx.x or higher.

## How to Use

1.  Install the extension from the VS Code Marketplace.
2.  Open a Satisfactory `.sav` file in VS Code.
3.  The file will be automatically unpacked and displayed as JSON.
4.  Make your desired changes.
5.  Press `Ctrl+S` (or `Cmd+S`) to save. The extension will repackage the file.

## Known Issues & Limitations

- **Performance:** Large save files (>50MB) can be very slow to open and may make VS Code unresponsive. The JSON representation can be several gigabytes.
- Editing complex structures like `mSplineData` can easily lead to save corruption if not done carefully.

## Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.

## Credits

Built using the logic from the [Satisfactory Calculator Interactive Map (SCIM)](https://satisfactory-calculator.com/en/interactive-map).
