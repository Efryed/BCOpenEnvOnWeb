# bcopenenvonweb

VS Code extension to quickly open AL environments in the Business Central web client, using configuration from your workspace's `.vscode/launch.json`.

## Features

- Scans `.vscode/launch.json` for AL launch configurations.
- Presents a quick pick list of available AL environments.
- Opens the selected environment in your default browser.
- Supports Sandbox environments and tenant-specific URLs.

## Usage

1. Open a workspace containing a `.vscode/launch.json` with AL launch configurations.
2. Run the command: **Open AL Environment on Web** (`bcopenenvonweb.openEnvOnWeb`) from the Command Palette.
3. Select the desired environment from the quick pick list.
4. The extension will open the corresponding Business Central web client URL.

## Requirements

- A workspace with a valid `.vscode/launch.json` containing AL launch configurations.

## Extension Settings

This extension does not contribute any settings.

## Known Issues

- Only supports AL launch configurations.
- Only environments of type `Sandbox` are supported.
- Requires the `environmentName` property in launch.json configurations.

## Release Notes

### 1.0.0

Initial release: open AL environments in the Business Central web client from launch.json.

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
