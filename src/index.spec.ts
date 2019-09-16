import { getValidatorsFromString } from ".";
import { extractFlags } from "./flags";

describe("Generate io-ts validators", () => {
  test("generates proper validators for primitive types", () => {
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

  test("generates proper validators for basic interfaces and object types", () => {
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

  test("generates proper validators for arrays", () => {
    expect(getValidatorsFromString("type arr = string[]")).toBe(
      "const arr = t.array(t.string)"
    );
    expect(getValidatorsFromString("type arr = Array<{foo: string}>")).toBe(
      "const arr = t.array(t.type({foo: t.string}))"
    );
  });

  test("generates proper validators for record types", () => {
    expect(getValidatorsFromString("type rec = Record<number, string>")).toBe(
      "const rec = t.record(t.number, t.string)"
    );
    expect(getValidatorsFromString("type rec = Record<string, null>")).toBe(
      "const rec = t.record(t.string, t.null)"
    );
  });

  test("generates proper validators for union types", () => {
    expect(getValidatorsFromString("type un = string | number")).toBe(
      "const un = t.union([t.string, t.number])"
    );
    expect(
      getValidatorsFromString("type un = string | number | { foo: string }")
    ).toBe("const un = t.union([t.string, t.number, t.type({foo: t.string})])");
  });

  test("generates proper validators for intersection types", () => {
    expect(
      getValidatorsFromString(
        "type inter = { foo: string } | { bar: number } | { foo: number }"
      )
    ).toBe(
      "const inter = t.union([t.type({foo: t.string}), t.type({bar: t.number}), t.type({foo: t.number})])"
    );
  });
});

describe("Internals", () => {
  test("gets binary flags", () => {
    expect(extractFlags(10)).toEqual([8, 2]);
    expect(extractFlags(100)).toEqual([64, 32, 4]);
  });
});
