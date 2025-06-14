import { matchesStringOrRegExp, optionsMatches } from "./utils.js";

describe("utils", () => {
  describe("optionsMatches", () => {
    it("optionsMatches matches a string", () => {
      expect(optionsMatches({ foo: "bar" }, "foo", "bar")).toBeTruthy();

      expect(optionsMatches({ foo: "bar" }, "foo", "BAR")).toBeFalsy();
      expect(optionsMatches("not an object", "foo", "bar")).toBeFalsy();
      expect(optionsMatches({ baz: "bar" }, "foo", "bar")).toBeFalsy();
      expect(optionsMatches({ foo: "100" }, "foo", 100)).toBeFalsy();
      expect(optionsMatches({ foo: "baz" }, "foo", "bar")).toBeFalsy();

      expect(
        optionsMatches({ foo: ["baz", "bar"] }, "foo", "bar"),
      ).toBeTruthy();
      expect(optionsMatches({ foo: ["baz", "qux"] }, "foo", "bar")).toBeFalsy();
    });

    it("optionsMatches matches a RegExp", () => {
      expect(optionsMatches({ foo: "/\\.bar/" }, "foo", ".bar")).toBeTruthy();
      expect(optionsMatches({ foo: "/\\.baz$/" }, "foo", ".bar")).toBeFalsy();

      expect(optionsMatches({ foo: "/[a-z]+/" }, "foo", "BAR")).toBeFalsy();
      expect(optionsMatches({ foo: "/[A-Z]+/" }, "foo", "BAR")).toBeTruthy();

      expect(optionsMatches({ foo: "/[a-z]+/i" }, "foo", "BAR")).toBeTruthy();
      expect(optionsMatches({ foo: "/[A-Z]+/i" }, "foo", "bar")).toBeTruthy();

      expect(
        optionsMatches({ foo: ["/\\.bar$/", ".baz"] }, "foo", ".bar"),
      ).toBeTruthy();
      expect(
        optionsMatches({ foo: ["/\\.bar$/", ".baz"] }, "foo", ".baz"),
      ).toBeTruthy();
      expect(
        optionsMatches({ foo: ["/\\.bar$/", "qux"] }, "foo", ".baz"),
      ).toBeFalsy();
    });

    it("optionsMatches does not match any value without the property", () => {
      expect(optionsMatches({}, "foo", "bar")).toBeFalsy();
    });

    it("optionsMatches does not match any value with the empty array property", () => {
      expect(optionsMatches({ foo: [] }, "foo", "bar")).toBeFalsy();
    });

    describe("matchesStringOrRegExp", () => {
      it("matchesStringOrRegExp comparing with string comparisonValues", () => {
        expect(matchesStringOrRegExp("bar", "bar")).toEqual({
          match: "bar",
          pattern: "bar",
          substring: "bar",
        });
        expect(matchesStringOrRegExp("bar", "/bar something")).toBeFalsy();
        expect(
          matchesStringOrRegExp("/bar something", "/bar something"),
        ).toEqual({
          match: "/bar something",
          pattern: "/bar something",
          substring: "/bar something",
        });
        expect(
          matchesStringOrRegExp("bar something/", "bar something/"),
        ).toEqual({
          match: "bar something/",
          pattern: "bar something/",
          substring: "bar something/",
        });
        expect(
          matchesStringOrRegExp("bar something/", "bar something//"),
        ).toBeFalsy();

        expect(matchesStringOrRegExp(["foo", "bar"], "bar")).toEqual({
          match: "bar",
          pattern: "bar",
          substring: "bar",
        });
        expect(matchesStringOrRegExp(["foo", "baz"], "bar")).toBeFalsy();

        expect(matchesStringOrRegExp("bar", ["foo", "bar"])).toEqual({
          match: "bar",
          pattern: "bar",
          substring: "bar",
        });
        expect(matchesStringOrRegExp("bar", ["foo", "baz"])).toBeFalsy();

        expect(matchesStringOrRegExp(["foo", "baz"], ["foo", "bar"])).toEqual({
          match: "foo",
          pattern: "foo",
          substring: "foo",
        });
        expect(
          matchesStringOrRegExp(["bar", "hooha"], ["foo", "baz"]),
        ).toBeFalsy();
      });

      it("matchesStringOrRegExp comparing with a RegExp comparisonValue", () => {
        expect(matchesStringOrRegExp(".foo", "/\\.foo$/")).toEqual({
          match: ".foo",
          pattern: "/\\.foo$/",
          substring: ".foo",
        });
        expect(matchesStringOrRegExp("bar .foo", "/\\.foo$/")).toEqual({
          match: "bar .foo",
          pattern: "/\\.foo$/",
          substring: ".foo",
        });
        expect(matchesStringOrRegExp("bar .foo bar", "/\\.foo$/")).toBeFalsy();
        expect(matchesStringOrRegExp("foo", "/\\.foo$/")).toBeFalsy();

        expect(matchesStringOrRegExp([".foo", "bar"], "/\\.foo$/")).toEqual({
          match: ".foo",
          pattern: "/\\.foo$/",
          substring: ".foo",
        });
        expect(matchesStringOrRegExp(["foo", "baz"], "/\\.foo$/")).toBeFalsy();

        expect(matchesStringOrRegExp(".foo", ["/\\.foo$/", "/^bar/"])).toEqual({
          match: ".foo",
          pattern: "/\\.foo$/",
          substring: ".foo",
        });
        expect(matchesStringOrRegExp("bar", ["/\\.foo$/", "/^bar/"])).toEqual({
          match: "bar",
          pattern: "/^bar/",
          substring: "bar",
        });
        expect(
          matchesStringOrRegExp("ebarz", ["/\\.foo$/", "/^bar/"]),
        ).toBeFalsy();

        expect(
          matchesStringOrRegExp([".foo", "ebarz"], ["/\\.foo$/", "/^bar/"]),
        ).toEqual({
          match: ".foo",
          pattern: "/\\.foo$/",
          substring: ".foo",
        });
        expect(
          matchesStringOrRegExp(["bar", "foo"], ["/\\.foo$/", "/^bar/"]),
        ).toEqual({
          match: "bar",
          pattern: "/^bar/",
          substring: "bar",
        });
        expect(
          matchesStringOrRegExp(["ebarz", "foo"], ["/\\.foo$/", "/^bar/"]),
        ).toBeFalsy();
        expect(matchesStringOrRegExp(["foobar"], ["/FOO/"])).toBeFalsy();
        expect(matchesStringOrRegExp(["FOOBAR"], ["/FOO/"])).toEqual({
          match: "FOOBAR",
          pattern: "/FOO/",
          substring: "FOO",
        });
      });

      it("matchesStringOrRegExp comparing with a actual RegExp comparisonValue", () => {
        expect(matchesStringOrRegExp(".foo", /.foo$/)).toEqual({
          match: ".foo",
          pattern: /.foo$/,
          substring: ".foo",
        });
        expect(matchesStringOrRegExp("bar .foo", /.foo$/)).toEqual({
          match: "bar .foo",
          pattern: /.foo$/,
          substring: ".foo",
        });
        expect(matchesStringOrRegExp("bar .foo bar", /.foo$/)).toBeFalsy();
        expect(matchesStringOrRegExp("foo", /.foo$/)).toBeFalsy();
        expect(
          matchesStringOrRegExp([".foo", "ebarz"], [/.foo$/, /^bar/]),
        ).toEqual({
          match: ".foo",
          pattern: /.foo$/,
          substring: ".foo",
        });
        expect(matchesStringOrRegExp(["foobar"], [/FOO/])).toBeFalsy();
        expect(matchesStringOrRegExp(["FOOBAR"], [/FOO/])).toEqual({
          match: "FOOBAR",
          pattern: /FOO/,
          substring: "FOO",
        });
      });

      it("matchesStringOrRegExp comparing with an empty array", () => {
        expect(matchesStringOrRegExp(".foo", [])).toBeFalsy();
      });
    });
  });
});
