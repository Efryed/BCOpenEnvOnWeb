
export type SolutionInfo = {
    id: string;
    name: string;
    publisher: string;
    version: string;
};

export type BuildALProjectParams = {
    alcPath: string;
    projectPath: string;
    outputPath: string;
    symbolsPath: string;
    analizerParam: string | null;
};
    