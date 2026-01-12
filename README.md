# FJRE AL Simple Tools

VS Code extension to quickly open AL environments in the Business Central web client and compile AL projects with version management.

## Features

- Scans `.vscode/launch.json` for AL launch configurations.
- Presents a quick pick list of available AL environments.
- Opens the selected environment in your default browser.
- Supports Sandbox environments and tenant-specific URLs.
- Compiles AL projects using `alc.exe` from the AL VS Code extension.
- Automatic revision version increment after successful builds.
- Support for code analyzers (CodeCop, UICop, AppSourceCop, PerTenantExtensionCop).

## Usage

### Open AL Environment on Web

1. Open a workspace containing a `.vscode/launch.json` with AL launch configurations.
2. Run the command: **FJRE AL Simple Tools: Open Environment on Web** (`fjre-alsimpletools.openEnvOnWeb`) from the Command Palette.
3. Select the desired environment from the quick pick list.
4. The extension will open the corresponding Business Central web client URL in your default browser.

### Build AL Project

1. Run the command: **FJRE AL Simple Tools: Build AL Project** (`fjre-alsimpletools.buildALProject`) from the Command Palette.
2. When prompted, optionally enter a custom version number (format: Major.Minor.Build.Revision) or leave empty to use the current version from `app.json`.
3. The extension will compile your AL project using `alc.exe`, output a `.app` file to the `out/` folder, and automatically increment the revision version in `app.json`.
4. Build output is logged to the `BCOpenEnvOnWeb` Output channel.

## Commands

- **FJRE AL Simple Tools: Open Environment on Web** — `fjre-alsimpletools.openEnvOnWeb`  
  Opens the selected AL launch configuration in the Business Central web client.

- **FJRE AL Simple Tools: Build AL Project** — `fjre-alsimpletools.buildALProject`  
  Compiles the current workspace AL project using `alc.exe`. Prompts for an optional custom version. On successful build, automatically increments the revision number in `app.json`. Uses `.alpackages` for symbols and writes the compiled `.app` to `out/`. If code analyzers are enabled in `.vscode/settings.json`, they will be passed to the compiler where available.

## Prerequisites

- VS Code with the AL extension installed (extension id prefix `ms-dynamics-smb.al-`). The extension's highest installed version is used to find `alc.exe`.
- For build functionality:
  - A `.alpackages` folder in the workspace containing required symbol packages.
  - A valid `app.json` file in the workspace root with `publisher`, `name`, and `version` fields.
  - Version must be in format: Major.Minor.Build.Revision (e.g., 1.0.0.0).
- To enable analyzers, set `al.enableCodeAnalysis` to `true` and list analyzers in `al.codeAnalyzers` inside `.vscode/settings.json`. Supported analyzers: CodeCop, UICop, AppSourceCop, PerTenantExtensionCop.

## Notes

- The build step expects `alc.exe` under the AL extension's `bin/win32/alc.exe` path (Windows only).
- Analyzer DLLs are searched recursively under the AL extension installation and included if found and enabled.
- Build output and compiler logs are displayed in the `BCOpenEnvOnWeb` Output channel.
- The compiled `.app` file follows the naming pattern: `{publisher}_{name}_{version}_PTE.app`
- Version is automatically incremented at the revision level (rightmost number) after each successful build.

## Requirements

- A workspace with a valid `.vscode/launch.json` containing AL launch configurations.
- For build functionality: a valid `app.json` file in the workspace root.

## Extension Settings

This extension does not contribute any settings.

## Known Issues

- Only supports AL launch configurations.
- Only environments of type `Sandbox` are supported for web opening.
- Build requires Windows (`alc.exe` is only available in the AL extension's `win32` bin path).
- Analyzers are only included if present in the AL extension installation and enabled via workspace settings.
- Build command requires manual version input; no automatic version increment from revision alone is performed before custom version check.

## Release Notes

### 1.1.0

- Added "Build AL Project" command to compile AL projects using alc.exe from the AL extension.
- Added support for optional custom version input during build.
- Added automatic revision version increment in app.json after successful builds.
- Added support for passing enabled analyzers (when configured in `.vscode/settings.json`).

### 1.0.0

Initial release: open AL environments in the Business Central web client from launch.json.

---

## Extension Guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

**Enjoy!**
