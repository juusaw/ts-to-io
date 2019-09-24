export interface IoToTsConfig {
  followImports: boolean;
  includeHeader: boolean;
}

export const defaultConfig: IoToTsConfig = {
  followImports: false,
  includeHeader: true
};
