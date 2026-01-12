// Write a function that get this file
// C:\Users\rojas\.vscode\extensions\ms-dynamics-smb.al-15.2.16304953\bin\alc.exe
// ms-dynamics-smb.al-15.2.16304953 can change, get that highest version installed
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { spawn } from 'child_process';
import { GetEnabledanalyzerPaths } from './getAnalizer';
import * as customTypes from './customTypes';
import { error } from 'console';
import { GetSolutionInfoObject, modifyVersionInFile, UpdateVersion, ValidaThatAppFileWithVersionExists } from './updateVersion';

function getAlExtensionPath(): string | null {
    const extensionsPath = path.join(os.homedir(), '.vscode', 'extensions');
    if (!fs.existsSync(extensionsPath)) {
        return null;
    }

    const extensionDirs = fs.readdirSync(extensionsPath).filter(dir => dir.startsWith('ms-dynamics-smb.al-'));
    if (extensionDirs.length === 0) {
        return null;
    }
    // Sort directories to get the highest version
    extensionDirs.sort((a, b) => {
        const versionA = a.replace('ms-dynamics-smb.al-', '');
        const versionB = b.replace('ms-dynamics-smb.al-', '');
        return CompareVersions(versionA, versionB);
    });

    const alcPath = path.join(extensionsPath, extensionDirs[extensionDirs.length - 1]);
    return fs.existsSync(alcPath) ? alcPath : null;
}

function GetAnalyzerParam(projectPath: string, alExtensionPath: string): string | null{
    const analyzerPaths = GetEnabledanalyzerPaths(projectPath, alExtensionPath);
    if (analyzerPaths.length > 0) {
        console.log("Enabled analyzers:");
        analyzerPaths.forEach(p => console.log(p));
        return `/analyzer:"${analyzerPaths.join(',')}"`;
    }
    console.log("No analyzers enabled.");
    return null;
}


function VerifyDirectory(dirPath: string, createIfNotExist: boolean): boolean {
    if (fs.existsSync(dirPath))
        return true;

    if (createIfNotExist) {
        try {
            fs.mkdirSync(dirPath, { recursive: true });
            return true
        } catch (error) {
            console.error(`Error creating directory ${dirPath}:`, error);
            return false;
        }
    }

    return false;
}

function RunAlcShowOutput(
    projectParams: customTypes.BuildALProjectParams,
    OutputChannel:vscode.OutputChannel, 
    susccessCallback: () => void, 
    errorCallback: (error: string) => void
) {

    const params = [
        `/project:"${projectParams.projectPath}"`,
        `/packagecachepath:"${projectParams.symbolsPath}"`,
        `/out:"${projectParams.outputPath}"`
    ]

    if (projectParams.analizerParam) {
        params.push(projectParams.analizerParam);
    }

    OutputChannel.show(true);
    OutputChannel.appendLine(`Running alc.exe with parameters:`);
    params.forEach(p => OutputChannel.appendLine(p));

    const alcProcess = spawn(projectParams.alcPath, params);

    alcProcess.stdout.on('data', (data) => {
        // console.log(`alc.exe: ${data}`);
        OutputChannel.append(data.toString());
    });

    alcProcess.stderr.on('data', (data) => {
        // console.error(`alc.exe error: ${data}`);
        OutputChannel.append(data.toString());
    });

    alcProcess.on('close', (code) => {
        if (code === 0) {
            susccessCallback();
        }   else {  
            errorCallback(`alc.exe exited with code ${code}`);
        }
    });

}


function CompareVersions(versionA: string, versionB: string): number {
    const versionAParts = versionA.split('.').map(part => parseInt(part, 10));
    const versionBParts = versionB.split('.').map(part => parseInt(part, 10));
    const length = Math.min(versionAParts.length, versionBParts.length);
    for (let i = 0; i < length; i++) {
        if (versionAParts[i] < versionBParts[i]) {
            return -1;
        } else if (versionAParts[i] > versionBParts[i]) {
            return 1;
        }
    }
    if (versionA.length < versionB.length) {
        return -1;
    } else if (versionA.length > versionB.length) {
        return 1;
    }
    return 0;
}


export function BuildALProject(
    projectPath: string,
    customVersion: string | null,
    OutputChannel:any ,
    susccessCallback: () => void,
    errorCallback: (error: string) => void
) {
    const symbolsPath = path.join(projectPath, '.alpackages');
    const outputPath = path.join(projectPath, 'out');
    if (!VerifyDirectory(symbolsPath, false)) {
        errorCallback(`Symbols directory does not exist: ${symbolsPath}`);
        return;
    }
    if (!VerifyDirectory(outputPath, true)) {
        errorCallback(`Failed to create output directory: ${outputPath}`);
        return;
    }

    const SolutionInfo = GetSolutionInfoObject(projectPath);
    if (!SolutionInfo) {
        errorCallback(`Failed to read solution info from app.json in project path: ${projectPath}`);
        return;
    }

    // publisher_name_version_PTE.app
    if (customVersion) {

        if (!modifyVersionInFile(path.join(projectPath, 'app.json'), customVersion))
        {
            errorCallback(`Failed to modify version in app.json to ${customVersion}`);
            return;
        }

        SolutionInfo.version = customVersion;
    }

    if (ValidaThatAppFileWithVersionExists(outputPath, SolutionInfo.version)) {
        errorCallback(`App file with version ${SolutionInfo.version} already exists in output path: ${outputPath}`);
        return;
    }
    
    const appName = `${SolutionInfo.publisher}_${SolutionInfo.name}_${SolutionInfo.version}_PTE.app`;
    const outputPathApp = path.join(outputPath, appName);

    const alExtPath = getAlExtensionPath();
    if (!alExtPath) {
        error("AL Extension for VSCode not found.");
        return;
    }
    const alcPath = path.join(alExtPath, 'bin', 'win32', 'alc.exe');
    if (!alcPath) {
        error("alc.exe not found in AL Extension.");
        return;
    }
    const analizerParam = GetAnalyzerParam(projectPath, alExtPath);

    const ProjectParams: customTypes.BuildALProjectParams = {
        alcPath: alcPath,
        projectPath: projectPath,
        outputPath: outputPathApp,
        symbolsPath: symbolsPath,
        analizerParam: analizerParam,
    };

    RunAlcShowOutput(ProjectParams,OutputChannel, susccessCallback, errorCallback);
}
