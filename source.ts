export interface TestInterface {
  foo: string;
  bar: number;
}

export type TestType = {
  baz: object;
};

export const testValue: { foo: "asd"; bar: number | undefined } = {
  foo: "asd" as const,
  bar: 1
};

export const anotherValue = "test" as const;

export const moreValues = 99 as const;

type zero = 0;
type one = 1;

export type UnionTest = { foo: string } | { foo: number };

export type IntersectionTest = { foo: string } & { bar: number };

export type TupleTest = [string, number, 1];

export type TupleWithRestTest = [number, ...string[]];

export type ArrayTest1 = Array<string>;

export type ArrayTest2 = string[];

export type AnyType = any;

//export type UnknownType = unknown;

export type NullAndUndefined = {
  foo: null;
  bar: undefined;
};

// export const binary: zero | one = 1;

// export const ti: TestInterface = {
//   foo: "asd",
//   bar: 2
// };

type str = string;
type num = number;
