// jsonc-parser.test.ts (Bun tests)
import { describe, it, expect } from "bun:test";
import { parseJSONC } from "./jsonc-parser";

describe("JSONC Parser", () => {
  it("parses object with comments", () => {
    const result = parseJSONC(`{
      // comment
      "a": 1,
      /* block */
      "b": 2
    }`);

    expect(result).toEqual({ a: 1, b: 2 });
  });

  it("parses array with comments", () => {
    const result = parseJSONC(`[1, // hi
      2,
      /* test */
      3]`);

    expect(result).toEqual([1, 2, 3]);
  });

  it("handles nested", () => {
    const result = parseJSONC(`{
      "a": {
        // inner
        "b": [1,2,3]
      }
    }`);

    expect(result).toEqual({ a: { b: [1, 2, 3] } });
  });

  it("throws on invalid", () => {
    expect(() => parseJSONC("{ \"a\": }")).toThrow();
  });
});
