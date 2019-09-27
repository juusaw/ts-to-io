export const DEFAULT_FILE_NAME = "io-to-ts.ts";

export interface TsToIoConfig {
  followImports: boolean;
  includeHeader: boolean;
  fileNames: string[];
}

export const defaultConfig: TsToIoConfig = {
  followImports: false,
  includeHeader: true,
  fileNames: []
};
