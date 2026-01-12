import * as fs from 'fs';
import * as path from 'path';

function GetSettingsJsonPath(appDir: string): string {
    // .vscode\settings.json
    const settingsPath = path.join(appDir, '.vscode', 'settings.json');
    return settingsPath;
}

function findFileRecursively(dir: string, fileName: string): string | null {
    try {
        const queue = [dir];

        while (queue.length > 0) {
            const currentDir = queue.shift()!;
            const files = fs.readdirSync(currentDir);

            for (const file of files) {
                const fullPath = path.join(currentDir, file);

                try {
                    const stat = fs.statSync(fullPath);
                    if (stat.isFile() && file === fileName) {
                        return fullPath;
                    }

                    if (stat.isDirectory()) {
                        queue.push(fullPath);
                    }
                } catch (error) {
                    continue;
                }
            }
        }
    } catch (error) {
        return null;
    }

    return null;
}

export function GetEnabledanalyzerPaths(appDir: string, alExtPath: string): string[] {
    const settingsPath = GetSettingsJsonPath(appDir);
    const dllMap: { [key: string]: string } = {
        'CodeCop': 'Microsoft.Dynamics.Nav.CodeCop.dll',
        'UICop': 'Microsoft.Dynamics.Nav.UICop.dll',
        'AppSourceCop': 'Microsoft.Dynamics.Nav.AppSourceCop.dll',
        'PerTenantExtensionCop': 'Microsoft.Dynamics.Nav.PerTenantExtensionCop.dll'
    };
    const supported = ['CodeCop', 'UICop', 'AppSourceCop', 'PerTenantExtensionCop'];
    let enabled: string[] = [];
    if (settingsPath && fs.existsSync(settingsPath)) {
        try {
            const jsonData = fs.readFileSync(settingsPath, 'utf-8');
            const json = JSON.parse(jsonData);
            if (json['al.enableCodeAnalysis'] == undefined || !json['al.enableCodeAnalysis']) {
                return enabled;
            }
            if (json['al.codeAnalyzers'] != undefined) {
                enabled = json['al.codeAnalyzers'].map((item: string) => item.replace(/\$\{|\}/g, ''));
            }
        } catch (error) { }
    } else {
        return enabled;
    }
    // Filter and deduplicate
    enabled = Array.from(new Set(enabled.filter(name => supported.includes(name))));
    // Find DLL paths in AL extension
    const dllPaths: string[] = [];
    if (alExtPath && fs.existsSync(alExtPath)) {
        for (const name of enabled) {
            const dll = dllMap[name];
            if (dll != undefined) {
                const found = findFileRecursively(alExtPath, dll);
                if (found) {
                    dllPaths.push(found);
                }
            }
        }
    }
    return dllPaths;
}