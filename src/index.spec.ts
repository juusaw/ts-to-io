import { getValidatorsFromString } from ".";

test("generates proper validators for primitive types", () => {
  const source = `
    type num = number;
  `;
  expect(getValidatorsFromString(source)).toBe("const num = t.number");
});
