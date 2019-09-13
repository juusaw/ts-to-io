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
