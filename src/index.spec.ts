import { getValidatorsFromString } from ".";
import { extractFlags } from "./flags";

describe("Generate io-ts validators", () => {
  test("generates validators for primitive types", () => {
    expect(getValidatorsFromString("type num = number;")).toBe(
      "const num = t.number"
    );
    expect(getValidatorsFromString("type str = string;")).toBe(
      "const str = t.string"
    );
    expect(getValidatorsFromString("type nil = null;")).toBe(
      "const nil = t.null"
    );
  });

  test("generates validators for basic interfaces and object types", () => {
    const inputInterface = `
    interface Test { foo: number, bar: string }
  `;
    const inputObjectType = `
    type Test = { foo: number, bar: string }
  `;
    const result = "const Test = t.type({foo: t.number, bar: t.string})";

    expect(getValidatorsFromString(inputInterface)).toBe(result);
    expect(getValidatorsFromString(inputObjectType)).toBe(result);
  });

  test("generates validators for arrays", () => {
    expect(getValidatorsFromString("type arr = string[]")).toBe(
      "const arr = t.array(t.string)"
    );
    expect(getValidatorsFromString("type arr = Array<{foo: string}>")).toBe(
      "const arr = t.array(t.type({foo: t.string}))"
    );
  });

  test("generates validators for record types", () => {
    expect(getValidatorsFromString("type rec = Record<number, string>")).toBe(
      "const rec = t.record(t.number, t.string)"
    );
    expect(getValidatorsFromString("type rec = Record<string, null>")).toBe(
      "const rec = t.record(t.string, t.null)"
    );
  });

  test("generates validators for union types", () => {
    expect(getValidatorsFromString("type un = string | number")).toBe(
      "const un = t.union([t.string, t.number])"
    );
    expect(
      getValidatorsFromString("type un = string | number | { foo: string }")
    ).toBe("const un = t.union([t.string, t.number, t.type({foo: t.string})])");
  });

  test("optimizes validator for string literal union types", () => {
    expect(getValidatorsFromString("type un = 'foo' | 'bar'")).toBe(
      'const un = t.keyof({"foo": null, "bar": null})'
    );
  });

  test("generates validators for intersection types", () => {
    expect(
      getValidatorsFromString(
        "type inter = { foo: string } | { bar: number } | { foo: number }"
      )
    ).toBe(
      "const inter = t.union([t.type({foo: t.string}), t.type({bar: t.number}), t.type({foo: t.number})])"
    );
  });

  test("generates validators for function types", () => {
    expect(getValidatorsFromString("type fn = () => void")).toBe(
      "const fn = t.Function"
    );
    expect(
      getValidatorsFromString(
        "type fn = (s: string, n: number) => (b: boolean) => object"
      )
    ).toBe("const fn = t.Function");
  });

  test("generates validators for literal types", () => {
    expect(getValidatorsFromString('type foo = "foo"')).toBe(
      'const foo = t.literal("foo")'
    );
    expect(getValidatorsFromString("type one = 1")).toBe(
      "const one = t.literal(1)"
    );
    expect(getValidatorsFromString("type f = false")).toBe(
      "const f = t.literal(false)"
    );
  });

  test("handles nullable types correctly", () => {
    expect(getValidatorsFromString('type foobar = "foo" | "bar" | null')).toBe(
      'const foobar = t.union([t.null, t.literal("foo"), t.literal("bar")])'
    );
  });
});

describe("Internals", () => {
  test("gets binary flags", () => {
    expect(extractFlags(10)).toEqual([8, 2]);
    expect(extractFlags(100)).toEqual([64, 32, 4]);
  });
});
