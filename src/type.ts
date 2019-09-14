import * as ts from "typescript";

export function isObjectType(type: ts.Type): type is ts.ObjectType {
  return type.flags === ts.TypeFlags.Object;
}

export function isPrimitiveType(type: ts.Type) {
  return [
    ts.TypeFlags.String,
    ts.TypeFlags.Number,
    ts.TypeFlags.Boolean,
    ts.TypeFlags.Null
  ].includes(type.flags);
}

export function isAnyOrUnknown(type: ts.Type) {
  return [ts.TypeFlags.Any, ts.TypeFlags.Unknown].includes(type.flags);
}

export function isTupleType(
  type: ts.Type,
  checker: ts.TypeChecker
): type is ts.TupleType {
  const node = checker.typeToTypeNode(type);
  return ts.isTupleTypeNode(node!);
}

export function isRecordType(type: ts.Type) {
  return type.aliasSymbol && type.aliasSymbol.escapedName === "Record";
}

export function isStringIndexedObjectType(type: ts.Type) {
  return type.getStringIndexType();
}

export function isNumberIndexedType(type: ts.Type) {
  return type.getNumberIndexType();
}

export function isArrayType(type: ts.Type, checker: ts.TypeChecker) {
  const node = checker.typeToTypeNode(type);
  return ts.isArrayTypeNode(node!);
}
