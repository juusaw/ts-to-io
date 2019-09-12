import * as ts from "typescript";

const result: string[] = [];

function isObjectType(type: ts.Type): type is ts.ObjectType {
  return type.flags === ts.TypeFlags.Object;
}

function isPrimitiveType(type: ts.Type) {
  return [
    ts.TypeFlags.String,
    ts.TypeFlags.Number,
    ts.TypeFlags.Boolean,
    ts.TypeFlags.Null
  ].includes(type.flags);
}

function isAnyOrUnknown(type: ts.Type) {
  return [ts.TypeFlags.Any, ts.TypeFlags.Unknown].includes(type.flags);
}

function isTupleType(type: ts.Type): type is ts.TupleType {
  const node = checker.typeToTypeNode(type);
  return ts.isTupleTypeNode(node!);
}

function isArrayType(type: ts.Type) {
  const node = checker.typeToTypeNode(type);
  return ts.isArrayTypeNode(node!);
}

function processType(type: ts.Type): string {
  if (type.isLiteral()) {
    return "t.literal(" + checker.typeToString(type) + ")";
  } else if (isPrimitiveType(type)) {
    return "t." + checker.typeToString(type);
  } else if (type.isUnion()) {
    return `t.union([${type.types.map(processType).join(",")}])`;
  } else if (type.isIntersection()) {
    return `t.intersection([${type.types.map(processType).join(",")}])`;
  } else if (isTupleType(type)) {
    return `t.tuple([${(type as ts.TupleType).typeArguments!.map(
      processType
    )}])`;
  } else if (isArrayType(type)) {
    return `t.array(${processType(type.getNumberIndexType()!)})`;
  } else if (isObjectType(type)) {
    const properties = checker
      .getPropertiesOfType(type)
      .map(
        s =>
          [
            s.name,
            checker.getTypeOfSymbolAtLocation(s, s.valueDeclaration)
          ] as const
      );
    return `t.type({${properties
      .map(([n, t]) => n + ":" + processType(t))
      .join(", ")}})`;
  } else if (isAnyOrUnknown(type)) {
    return "t.unknown";
  }
  console.error("Unknown type with type flag: ", type.flags);
  return "null";
}

function handleTypeDeclaration(node: ts.TypeAliasDeclaration) {
  const symbol = checker.getSymbolAtLocation(node.name);
  const type = checker.getTypeAtLocation(node);
  result.push(`const ${symbol!.name} = ` + processType(type));
}

function handleInterfaceDeclaration(node: ts.InterfaceDeclaration) {
  const symbol = checker.getSymbolAtLocation(node.name);
  const type = checker.getTypeAtLocation(node);
  result.push(`const ${symbol!.name} = ` + processType(type));
}

function handleVariableDeclaration(node: ts.VariableStatement) {
  const symbol = checker.getSymbolAtLocation(
    node.declarationList.declarations[0].name
  );
  const type = checker.getTypeOfSymbolAtLocation(
    symbol!,
    symbol!.valueDeclaration!
  );
  if (symbol)
    console.log({
      b: checker.typeToString(
        checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration!)
      )
    });

  result.push(processType(type));
}

function visit(node: ts.Node) {
  if (ts.isTypeAliasDeclaration(node)) {
    handleTypeDeclaration(node);
  } else if (ts.isVariableStatement(node)) {
    handleVariableDeclaration(node);
  } else if (ts.isInterfaceDeclaration(node)) {
    handleInterfaceDeclaration(node);
  } else if (ts.isModuleDeclaration(node)) {
    ts.forEachChild(node, visit);
  }
}

const program = ts.createProgram(["test.ts"], {});
const checker = program.getTypeChecker();

for (const sourceFile of program.getSourceFiles()) {
  if (!sourceFile.isDeclarationFile) {
    ts.forEachChild(sourceFile, visit);
  }
}

console.log(result.join("\n\n"));
