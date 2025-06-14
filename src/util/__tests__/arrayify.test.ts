import { expect, suite, test } from "vitest";
import { arrayify } from "../arrayify.ts";

suite("arrayify", () => {
  test("returns array unchanged when input is already an array", () => {
    const input = [1, 2, 3];
    const result = arrayify(input);
    expect(result).toBe(input);
    expect(result).toEqual([1, 2, 3]);
  });

  test("wraps single value in array", () => {
    const result = arrayify(42);
    expect(result).toEqual([42]);
  });

  test("wraps string in array", () => {
    const result = arrayify("hello");
    expect(result).toEqual(["hello"]);
  });

  test("wraps object in array", () => {
    const obj = { name: "test" };
    const result = arrayify(obj);
    expect(result).toEqual([obj]);
  });

  test("wraps null in array", () => {
    const result = arrayify(null);
    expect(result).toEqual([null]);
  });

  test("wraps undefined in array", () => {
    const result = arrayify(undefined);
    expect(result).toEqual([undefined]);
  });

  test("wraps boolean in array", () => {
    const result = arrayify(true);
    expect(result).toEqual([true]);
  });

  test("handles empty array", () => {
    const input: number[] = [];
    const result = arrayify(input);
    expect(result).toBe(input);
    expect(result).toEqual([]);
  });

  test("preserves readonly array type", () => {
    const input: readonly string[] = ["a", "b", "c"];
    const result = arrayify(input);
    expect(result).toBe(input);
    expect(result).toEqual(["a", "b", "c"]);
  });

  test("maintains type safety with generics", () => {
    // Test with numbers
    const numberResult = arrayify(123);
    expect(numberResult).toEqual([123]);

    // Test with strings
    const stringResult = arrayify("test");
    expect(stringResult).toEqual(["test"]);

    // Test with arrays
    const arrayResult = arrayify([1, 2, 3]);
    expect(arrayResult).toEqual([1, 2, 3]);
  });
});
