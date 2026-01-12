// Write a function that get this file
// C:\Users\rojas\.vscode\extensions\ms-dynamics-smb.al-15.2.16304953\bin\alc.exe
// ms-dynamics-smb.al-15.2.16304953 can change, get that highest version installed
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { spawn } from 'child_process';
import { GetEnabledanalyzerPaths } from './getAnalizer';

export function getAlExtensionPath(): string | null {
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

function GetAnalyzerParam(projectPath: string, alExtensionPath: string): string {
    const analyzerPaths = GetEnabledanalyzerPaths(projectPath, alExtensionPath);
    if (analyzerPaths.length > 0) {
        console.log("Enabled analyzers:");
        analyzerPaths.forEach(p => console.log(p));
        return `/analyzer:"${analyzerPaths.join(',')}"`;
    }
    console.log("No analyzers enabled.");
    return "";
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

export function RunAlcShowOutput(alcPath: string, projectPath: string, outputPath: string, symbolsPath: string, analizerParam: string) {

    const alcProcess = spawn(alcPath, [
        `/project:"${projectPath}"`,
        `/packagecachepath:"${symbolsPath}"`,
        `/out:"${outputPath}"`,
        analizerParam
    ]);

    alcProcess.stdout.pipe(process.stdout);
    alcProcess.stderr.pipe(process.stderr);

    const exitCode = new Promise((resolve, reject) => {
        alcProcess.on('close', (code) => {
            if (code === 0) {
                resolve(code);
            } else {
                reject(new Error(`alc.exe exited with code ${code}`));
            }
        });
        alcProcess.on('error', (err) => {
            reject(err);
        });
    });

    return exitCode;
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


export function BuildALProject(projectPath: string): boolean {
    const symbolsPath = path.join(projectPath, '.alpackages');
    const outputPath = path.join(projectPath, 'out');
    if (!VerifyDirectory(symbolsPath, false)) {
        console.error("Symbols directory does not exist and could not be created.");
        return false;
    }
    if (!VerifyDirectory(outputPath, true)) {
        console.error("Output directory does not exist and could not be created.");
        return false;
    }
    const outputPathApp = path.join(outputPath, path.basename(projectPath, '.alproj') + '.app');

    const alExtPath = getAlExtensionPath();
    if (!alExtPath) {
        console.error("AL Extension not found.");
        return false;
    }
    const alcPath = path.join(alExtPath, 'bin', 'win32', 'alc.exe');
    if (!alcPath) {
        console.error("AL Compiler (alc.exe) not found.");
        return false;
    }
    const analizerParam = GetAnalyzerParam(projectPath, alExtPath);

    // Todo: Fix error handling, currently errors are not caught properly
    try {
        RunAlcShowOutput(alcPath, projectPath, outputPathApp, symbolsPath, analizerParam)
            .then(() => {
                console.log("AL project built successfully.");
            })
            .catch((error) => {
                console.error("Error building AL project:", error);
            });
        return true;
    } catch (error) {
        console.error("Unexpected error:", error);
        return false;
    }
}
