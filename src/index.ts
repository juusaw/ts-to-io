import * as ts from "typescript";
import {
  isPrimitiveType,
  isStringIndexedObjectType,
  isRecordType,
  isNumberIndexedType,
  isTupleType,
  isArrayType,
  isObjectType,
  isAnyOrUnknown
} from "./type";

const processProperty = (checker: ts.TypeChecker) => (s: ts.Symbol) => {
  return `${s.name}: ${processType(checker)(
    checker.getTypeOfSymbolAtLocation(s, s.valueDeclaration)
  )}`;
};

const processObjectType = (checker: ts.TypeChecker) => (
  type: ts.ObjectType
) => {
  const properties = checker.getPropertiesOfType(type);
  const requiredProperties = properties.filter(
    p => !(p.valueDeclaration as ts.ParameterDeclaration).questionToken
  );
  const optionalProperties = properties.filter(
    p => (p.valueDeclaration as ts.ParameterDeclaration).questionToken
  );
  if (requiredProperties.length && optionalProperties.length) {
    return `t.intersection([t.type({${requiredProperties.map(
      processProperty(checker)
    )}}), t.partial({${optionalProperties
      .map(processProperty(checker))
      .join(", ")}})])`;
  } else if (optionalProperties.length === 0) {
    return `t.type({${requiredProperties
      .map(processProperty(checker))
      .join(", ")}})`;
  } else {
    return `t.partial({${optionalProperties
      .map(processProperty(checker))
      .join(", ")}})`;
  }
};

const processType = (checker: ts.TypeChecker) => (type: ts.Type): string => {
  if (type.isLiteral()) {
    return "t.literal(" + checker.typeToString(type) + ")";
  } else if (isPrimitiveType(type)) {
    return "t." + checker.typeToString(type);
  } else if (isRecordType(type)) {
    const [key, value] = type.aliasTypeArguments!;
    return `t.record(${processType(checker)(key)}, ${processType(checker)(
      value
    )})`;
  } else if (isStringIndexedObjectType(type)) {
    return `t.record(t.string, ${processType(checker)(
      type.getStringIndexType()!
    )})`;
  } else if (isNumberIndexedType(type)) {
    return `t.record(t.number, ${processType(checker)(
      type.getNumberIndexType()!
    )})`;
  } else if (type.isUnion()) {
    return `t.union([${type.types.map(processType(checker)).join(", ")}])`;
  } else if (type.isIntersection()) {
    return `t.intersection([${type.types
      .map(processType(checker))
      .join(", ")}])`;
  } else if (isTupleType(type, checker)) {
    if (type.hasRestElement) {
      console.warn(
        "io-ts default validators do not support rest parameters in a tuple"
      );
    }
    return `t.tuple([${(type as ts.TupleType).typeArguments!.map(
      processType(checker)
    )}])`;
  } else if (isArrayType(type, checker)) {
    return `t.array(${processType(checker)(type.getNumberIndexType()!)})`;
  } else if (isObjectType(type)) {
    return processObjectType(checker)(type);
  } else if (isAnyOrUnknown(type)) {
    return "t.unknown";
  }
  console.error("Unknown type with type flag: ", type.flags);
  return "null";
};

function handleTypeDeclaration(
  node: ts.TypeAliasDeclaration,
  checker: ts.TypeChecker,
  result: string[]
) {
  const symbol = checker.getSymbolAtLocation(node.name);
  const type = checker.getTypeAtLocation(node);
  result.push(`const ${symbol!.name} = ` + processType(checker)(type));
}

function handleInterfaceDeclaration(
  node: ts.InterfaceDeclaration,
  checker: ts.TypeChecker,
  result: string[]
) {
  const symbol = checker.getSymbolAtLocation(node.name);
  const type = checker.getTypeAtLocation(node);
  result.push(`const ${symbol!.name} = ` + processType(checker)(type));
}

function handleVariableDeclaration(
  node: ts.VariableStatement,
  checker: ts.TypeChecker,
  result: string[]
) {
  const symbol = checker.getSymbolAtLocation(
    node.declarationList.declarations[0].name
  );
  const type = checker.getTypeOfSymbolAtLocation(
    symbol!,
    symbol!.valueDeclaration!
  );
  result.push(processType(checker)(type));
}

const visit = (checker: ts.TypeChecker, result: string[]) => (
  node: ts.Node
) => {
  if (ts.isTypeAliasDeclaration(node)) {
    handleTypeDeclaration(node, checker, result);
  } else if (ts.isVariableStatement(node)) {
    handleVariableDeclaration(node, checker, result);
  } else if (ts.isInterfaceDeclaration(node)) {
    handleInterfaceDeclaration(node, checker, result);
  } else if (ts.isModuleDeclaration(node)) {
    ts.forEachChild(node, visit(checker, result));
  }
};

export function getValidatorsFromString(source: string) {
  const DEFAULT_FILE_NAME = "io-to-ts.ts";
  const defaultCompilerHostOptions = ts.createCompilerHost({});

  const compilerHostOptions = {
    ...defaultCompilerHostOptions,
    getSourceFile: (
      filename: string,
      languageVersion: ts.ScriptTarget,
      ...restArgs: any[]
    ) => {
      if (filename === DEFAULT_FILE_NAME)
        return ts.createSourceFile(
          filename,
          source,
          ts.ScriptTarget.ES2015,
          true
        );
      else
        return defaultCompilerHostOptions.getSourceFile(
          filename,
          languageVersion,
          ...restArgs
        );
    }
  };

  const program = ts.createProgram(
    [DEFAULT_FILE_NAME],
    {},
    compilerHostOptions
  );
  const checker = program.getTypeChecker();
  const result: string[] = [];
  ts.forEachChild(
    program.getSourceFile(DEFAULT_FILE_NAME)!,
    visit(checker, result)
  );
  return result.join("\n\n");
}

export function getValidatorsFromFileNames(files: string[]) {
  const program = ts.createProgram(files, {});
  const checker = program.getTypeChecker();
  const result: string[] = [];
  for (const sourceFile of program.getSourceFiles()) {
    if (!sourceFile.isDeclarationFile) {
      ts.forEachChild(sourceFile, visit(checker, result));
    }
  }
  return result.join("\n\n");
}

function isEntryPoint() {
  return require.main === module;
}

if (isEntryPoint()) {
  console.log(getValidatorsFromFileNames([process.argv[2]]));
}
