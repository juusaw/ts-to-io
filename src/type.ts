import * as ts from "typescript";
import { extractFlags } from "./flags";

export function isObjectType(type: ts.Type): type is ts.ObjectType {
  return extractFlags(type.flags).includes(ts.TypeFlags.Object);
}

export function isPrimitiveType(type: ts.Type) {
  return extractFlags(type.flags).some(flag =>
    [
      ts.TypeFlags.String,
      ts.TypeFlags.Number,
      ts.TypeFlags.Boolean,
      ts.TypeFlags.Null,
      ts.TypeFlags.Undefined
    ].includes(flag)
  );
}

export function isAnyOrUnknown(type: ts.Type) {
  return extractFlags(type.flags).some(f =>
    [ts.TypeFlags.Any, ts.TypeFlags.Unknown].includes(f)
  );
}

export function isVoid(type: ts.Type) {
  return extractFlags(type.flags).includes(ts.TypeFlags.Void);
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

export function isFunctionType(type: ts.Type) {
  return !!type.getCallSignatures().length;
}

export function isBasicObjectType(type: ts.Type, checker: ts.TypeChecker) {
  return checker.typeToString(type) === "object";
}

export function isLiteralType(type: ts.Type) {
  return extractFlags(type.flags).some(f =>
    [
      ts.TypeFlags.StringLiteral,
      ts.TypeFlags.NumberLiteral,
      ts.TypeFlags.BooleanLiteral
    ].includes(f)
  );
}
