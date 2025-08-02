// This file is a copy of the `validateTypes.test.js` file from Stylelint's `lib/utils/__tests__/validateTypes.test.mjs` file.

import { isNumber, isRegExp, isString } from "./validateTypes.js";

describe("validateTypes", () => {
  describe("isNumber()", () => {
    it("returns true when a number value is specified", () => {
      expect(isNumber(1)).toBe(true);
    });

    it("returns true when a Number object is specified", () => {
      expect(isNumber(new Number(1))).toBe(true);
    });

    it("returns false when a number value is not specified", () => {
      expect(isNumber(null)).toBe(false);
    });
  });

  describe("isRegExp()", () => {
    it("returns true when a regexp value is specified", () => {
      expect(isRegExp(/a/)).toBe(true);
    });

    it("returns false when a regexp value is not specified", () => {
      expect(isRegExp(null)).toBe(false);
    });
  });

  describe("isString()", () => {
    it("returns true when a string value is specified", () => {
      expect(isString("")).toBe(true);
    });

    it("returns true when a String object is specified", () => {
      expect(isString(new String(""))).toBe(true);
    });

    it("returns false when a string value is not specified", () => {
      expect(isString(null)).toBe(false);
    });
  });
});
