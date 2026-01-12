
import * as fs from 'fs';
import { SolutionInfo} from './customTypes';
import * as path from 'path';
// update version type 1.0.0.1
// Major → Se reinician Minor, Build y Revision a 0.
// Minor → Se reinician Build y Revision a 0.
// Build → Se reinicia Revision a 0.
// Revision → Solo aumenta en 1.

export function UpdateVersion(version: string, updateType: 'major' | 'minor' | 'build' | 'revision'): string {
    const versionParts = version.split('.').map(part => parseInt(part, 10));
    switch (updateType) {
        case 'major':
            return `${versionParts[0] + 1}.0.0.0`;
        case 'minor':
            return `${versionParts[0]}.${versionParts[1] + 1}.0.0`;
        case 'build':
            return `${versionParts[0]}.${versionParts[1]}.${versionParts[2] + 1}.0`;
        case 'revision':
            return `${versionParts[0]}.${versionParts[1]}.${versionParts[2]}.${versionParts[3] + 1}`;
        default:
            throw new Error("Invalid update type");
    }
}

// Get file as json, get json.version, update version, write back to file.
export function modifyVersionInFile(filePath: string, newVersion: string): boolean {
    try {
        const fileData = fs.readFileSync(filePath, 'utf-8');
        const json = JSON.parse(fileData);
        json.version = newVersion;
        fs.writeFileSync(filePath, JSON.stringify(json, null, 4), 'utf-8');
        return true;
    } catch (error) {
        return false;
    }   
}

export function GetSolutionInfoObject(appDir: string): SolutionInfo | null {
    // Search for app.json in the appDir
    const appJsonPath = path.join(appDir, 'app.json');
    if (!fs.existsSync(appJsonPath))
        return null;

    try {
        const jsonData = fs.readFileSync(appJsonPath, 'utf-8');
        const json = JSON.parse(jsonData);
        const solutionInfo: SolutionInfo = {
            id: json.id,
            name: json.name,
            publisher: json.publisher,
            version: json.version
        };
        return solutionInfo;
    } catch (error) {
        return null;
    }
}

export function ValidateVersionFormat(version: string): boolean {
    const versionRegex = /^\d+\.\d+\.\d+\.\d+$/;
    return versionRegex.test(version);
}

// check the oputputPath for a file with .app extension and the version in its name
export function ValidaThatAppFileWithVersionExists(outputPath: string, version: string): boolean {
    if (!fs.existsSync(outputPath))
        return false;
    const files = fs.readdirSync(outputPath);
    for (const file of files) {
        if (file.endsWith('.app') && file.includes(`_${version}_`)) {
            return true;
        }
    }
    return false;
}