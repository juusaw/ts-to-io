import { getValidatorsFromString } from ".";

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

test("generates proper validators for record types", () => {
  expect(getValidatorsFromString("type rec = Record<number, string>")).toBe(
    "const rec = t.record(t.number, t.string)"
  );
  expect(getValidatorsFromString("type rec = Record<string, null>")).toBe(
    "const rec = t.record(t.string, t.null)"
  );
});
