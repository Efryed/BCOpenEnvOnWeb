// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "bcopenenvonweb" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
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

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }
