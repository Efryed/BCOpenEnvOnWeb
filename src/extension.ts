// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { BuildALProjectParams } from './compiler-helper/customTypes';
import { BuildALProject } from './compiler-helper/compilerHelper';
import { UpdateVersion, GetSolutionInfoObject, modifyVersionInFile, ValidateVersionFormat } from './compiler-helper/updateVersion';
import path from 'path';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	const OutputChannel = vscode.window.createOutputChannel("BCOpenEnvOnWeb");


	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "bcopenenvonweb" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable1 = vscode.commands.registerCommand('bcopenenvonweb.buildALProject', () => {
		OutputChannel.clear();
		console.log('Build AL Project command executed');
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (!workspaceFolders) {
			vscode.window.showErrorMessage('No workspace folder is open.');
			return;
		}

		// Prompt for custom version
		vscode.window.showInputBox({
			prompt: 'Enter custom version (leave empty to use current version)',
			placeHolder: 'e.g. 1.0.0.1'
		}).then((customVersion) => {
			let versionToUse: string | null = null;
			if (customVersion === undefined) {
				// User cancelled the input
				return;
			}

			if (customVersion.trim() === '') {
				versionToUse = null;
			} else {
				versionToUse = customVersion.trim();

				if (!ValidateVersionFormat(versionToUse)) {
					OutputChannel.appendLine('AL Project built successfully.');
					vscode.window.showErrorMessage('Invalid version format. Please use the format Major.Minor.Build.Revision.');
					return;
				}
			}

			const projectPath = workspaceFolders[0].uri.fsPath;
			const success = BuildALProject(projectPath, versionToUse, OutputChannel, () => {
				// on success
				OutputChannel.appendLine('AL Project built successfully.');

				const projectInfo = GetSolutionInfoObject(projectPath);
				if (!projectInfo) {
					OutputChannel.appendLine('Failed to get project info after build.');
					vscode.window.showErrorMessage('Failed to get project info after build.');
					return;
				}
				// update solution version in app.json
				const newVersion = UpdateVersion(projectInfo.version, 'revision');

				// Modidy version in app.json
				if (!modifyVersionInFile(path.join(projectPath, 'app.json'), newVersion)) {
					OutputChannel.appendLine('Failed to update version in app.json after build.');
					vscode.window.showErrorMessage('Failed to update version in app.json after build.');
					return;
				}

				OutputChannel.appendLine(`Updated solution version to ${newVersion} in app.json.`);
				vscode.window.showInformationMessage(`AL Project built successfully. Updated version to ${newVersion}.`);
			}, (error) => {
				// on error
				OutputChannel.appendLine('Failed to build AL Project: ' + error);
				vscode.window.showErrorMessage('Failed to build AL Project: ' + error);
			});


		},
			(error) => {
				vscode.window.showErrorMessage('Error getting custom version: ' + error.message);
			}
		);
	});


	const disposable = vscode.commands.registerCommand('bcopenenvonweb.openEnvOnWeb', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		// vscode.window.showInformationMessage('Hello vscode');

		// Search for a lauchh.json file in the .vscode folder and read its json content
		let workspaceFolders = vscode.workspace.workspaceFolders;
		if (workspaceFolders == undefined) {
			vscode.window.showErrorMessage('No workspace folder found.');
			return;
		}
		let launchJsonUri = vscode.Uri.joinPath(workspaceFolders[0].uri, '.vscode', 'launch.json');

		vscode.workspace.fs.readFile(launchJsonUri).then((data) => {
			let launchJson = JSON.parse(data.toString());
			// console.log(launchJson);
			// vscode.window.showInformationMessage('launch.json content logged to console.');

			// Get launchjson configurations(is a array) where request is "launch" and type is "al"
			const alLaunchConfigs = launchJson.configurations.filter((config: any) => config.request === 'launch' && config.type === 'al').map((config: any, index: number) => {
				// add index to each config
				return { ...config, index: index };
			});

			console.log(alLaunchConfigs);

			// if there is elemento show al environmentNames in a quick pick
			if (alLaunchConfigs.length <= 0) {
				vscode.window.showErrorMessage('No AL launch configurations found in launch.json.');
				return;
			}

			const environmentNames = alLaunchConfigs.map((config: any, index: number) => `${config.index} - ${config.environmentName}`).filter((name: string) => name);
			vscode.window.showQuickPick(environmentNames, {
				placeHolder: 'Select an AL Environment to open in Web Client'
			}).then((selected) => {
				if (selected == undefined)
					return;
				// Open the selected environment in the web client
				// const webClientUrl = `http://localhost:8080/?tenant=default&environment=${encodeURIComponent(selected)}`;
				// vscode.env.openExternal(vscode.Uri.parse(webClientUrl));

				// Get the index from the selected string
				const selectedIndex = parseInt(selected.split(' - ')[0]);
				const selectedConfig = alLaunchConfigs.find((config: any) => config.index === selectedIndex);
				if (selectedConfig.environmentType === 'Sandbox') {
					// Verify Selected config has Tenant property
					if (!selectedConfig.tenant) {
						// use default BC url for sandbox
						const webClientUrl = `https://businesscentral.dynamics.com/${selectedConfig.environmentName}`;
						vscode.env.openExternal(vscode.Uri.parse(webClientUrl));
					} else {
						const webClientUrl = `https://businesscentral.dynamics.com/${selectedConfig.tenant}/${selectedConfig.environmentName}`;
						vscode.env.openExternal(vscode.Uri.parse(webClientUrl));
					}
				}
			});
		}, (err) => {
			vscode.window.showErrorMessage('Could not read launch.json: ' + err.message);
		});
	});

	context.subscriptions.push(disposable, disposable1);
}

// This method is called when your extension is deactivated
export function deactivate() { }
