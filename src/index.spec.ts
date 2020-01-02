import { getValidatorsFromString } from ".";
import { extractFlags } from "./flags";
import { defaultConfig, DEFAULT_FILE_NAME } from "./config";

const testConfig = {
  ...defaultConfig,
  fileNames: [DEFAULT_FILE_NAME],
  includeHeader: false
};

describe("Generate io-ts validators", () => {
  test("generates validators for primitive types", () => {
    expect(getValidatorsFromString("type num = number;", testConfig)).toBe(
      "const num = t.number"
    );
    expect(getValidatorsFromString("type str = string;", testConfig)).toBe(
      "const str = t.string"
    );
    expect(getValidatorsFromString("type nil = null;", testConfig)).toBe(
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

    expect(getValidatorsFromString(inputInterface, testConfig)).toBe(result);
    expect(getValidatorsFromString(inputObjectType, testConfig)).toBe(result);
  });

  test("generates validators for interfaces with optional fields", () => {
    expect(
      getValidatorsFromString(
        "interface Test { foo: string, bar?: number }",
        testConfig
      )
    ).toBe(
      "const Test = t.intersection([t.type({foo: t.string}), t.partial({bar: t.union([t.undefined, t.number])})])"
    );
  });

  test("generates validators for arrays", () => {
    expect(getValidatorsFromString("type arr = string[]", testConfig)).toBe(
      "const arr = t.array(t.string)"
    );
    expect(
      getValidatorsFromString("type arr = Array<{foo: string}>", testConfig)
    ).toBe("const arr = t.array(t.type({foo: t.string}))");
  });

  test("generates validators for record types", () => {
    expect(
      getValidatorsFromString("type rec = Record<number, string>", testConfig)
    ).toBe("const rec = t.record(t.number, t.string)");
    expect(
      getValidatorsFromString("type rec = Record<string, null>", testConfig)
    ).toBe("const rec = t.record(t.string, t.null)");
  });

  test("generates validators for union types", () => {
    expect(
      getValidatorsFromString("type un = string | number", testConfig)
    ).toBe("const un = t.union([t.string, t.number])");
    expect(
      getValidatorsFromString(
        "type un = string | number | { foo: string }",
        testConfig
      )
    ).toBe("const un = t.union([t.string, t.number, t.type({foo: t.string})])");
  });

  test("optimizes validator for string literal union types", () => {
    expect(getValidatorsFromString("type un = 'foo' | 'bar'", testConfig)).toBe(
      'const un = t.keyof({"foo": null, "bar": null})'
    );
  });

  test("generates validators for intersection types", () => {
    expect(
      getValidatorsFromString(
        "type inter = { foo: string } | { bar: number } | { foo: number }",
        testConfig
      )
    ).toBe(
      "const inter = t.union([t.type({foo: t.string}), t.type({bar: t.number}), t.type({foo: t.number})])"
    );
  });

  test("generates validators for function types", () => {
    expect(getValidatorsFromString("type fn = () => void", testConfig)).toBe(
      "const fn = t.Function"
    );
    expect(
      getValidatorsFromString(
        "type fn = (s: string, n: number) => (b: boolean) => object",
        testConfig
      )
    ).toBe("const fn = t.Function");
  });

  test("generates validators for literal types", () => {
    expect(getValidatorsFromString('type foo = "foo"', testConfig)).toBe(
      'const foo = t.literal("foo")'
    );
    expect(getValidatorsFromString("type one = 1", testConfig)).toBe(
      "const one = t.literal(1)"
    );
    expect(getValidatorsFromString("type f = false", testConfig)).toBe(
      "const f = t.literal(false)"
    );
  });

  test("handles nullable types correctly", () => {
    expect(
      getValidatorsFromString('type foobar = "foo" | "bar" | null', testConfig)
    ).toBe(
      'const foobar = t.union([t.null, t.literal("foo"), t.literal("bar")])'
    );
  });
});

describe("Configuration", () => {
  test("includeHeader", () => {
    expect(getValidatorsFromString("type a = number;", testConfig)).toBe(
      "const a = t.number"
    );
    expect(
      getValidatorsFromString("type a = number;", {
        ...testConfig,
        includeHeader: true
      })
    ).toBe('import * as t from "io-ts"\n\nconst a = t.number');
  });
});

describe("Internals", () => {
  test("gets binary flags", () => {
    expect(extractFlags(0)).toEqual([]);
    expect(extractFlags(1)).toEqual([1]);
    expect(extractFlags(10)).toEqual([8, 2]);
    expect(extractFlags(100)).toEqual([64, 32, 4]);
    expect(extractFlags(67108864)).toEqual([67108864]);
  });
});
