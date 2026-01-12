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
5. To build an AL project from the workspace, run **Build AL Project** (`bcopenenvonweb.buildALProject`). The command will invoke alc.exe from the installed AL VS Code extension, output a .app file to the workspace `out` folder, and log output to the `BCOpenEnvOnWeb` Output channel.

## Commands

- Open AL Environment on Web — bcopenenvonweb.openEnvOnWeb  
  Opens the selected AL launch configuration in the Business Central web client.

- Build AL Project — bcopenenvonweb.buildALProject  
  Runs alc.exe to compile the current workspace AL project. Uses `.alpackages` for symbols and writes the compiled .app to `out/`. If code analyzers are enabled in `.vscode/settings.json`, they will be passed to the compiler where available.

## Prerequisites

- VS Code with the AL extension installed (extension id prefix `ms-dynamics-smb.al-`). The extension's highest installed version is used to find `alc.exe`.
- A `.alpackages` folder in the workspace containing required symbol packages.
- To enable analyzers, set `al.enableCodeAnalysis` to `true` and list analyzers in `al.codeAnalyzers` inside `.vscode/settings.json`. Supported analyzers: CodeCop, UICop, AppSourceCop, PerTenantExtensionCop.

## Notes

- The build step currently expects `alc.exe` under the AL extension's `bin/win32/alc.exe` path (Windows). Non-Windows platforms may require adjustments.
- Analyzer DLLs are searched under the AL extension installation and included if found.
- Build output and compiler logs are shown in the `BCOpenEnvOnWeb` Output channel.

## Requirements

- A workspace with a valid `.vscode/launch.json` containing AL launch configurations.

## Extension Settings

This extension does not contribute any settings.

## Known Issues

- Only supports AL launch configurations.
- Only environments of type `Sandbox` are supported for web opening.
- Build assumes `alc.exe` in the AL extension bin path (`win32`). This may not work on other OSes.
- Analyzers are only included if present in the AL extension installation and enabled via workspace settings.

## Release Notes

### 1.1.0

- Added "Build AL Project" command to compile AL projects using alc.exe from the AL extension.
- Added support for passing enabled analyzers (when configured in `.vscode/settings.json`).

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
