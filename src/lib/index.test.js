import { getTestRule } from "jest-preset-stylelint";
import { stripIndent } from "common-tags";

import plugin from "./index.js";

const {
  rule: { messages, ruleName },
} = plugin;

const testRule = getTestRule();

testRule({
  plugins: [plugin],
  ruleName,
  config: true,

  accept: [
    { code: "a { color: red; }" },
    { code: "a { color: red; background-color: blue; }" },
    { code: "a { color: red; transition: none; }" },
    { code: "body { --custom-property: red; }" },
    { code: "body { padding: 0; }" },
    { code: "::before { content: attr(foo); }" },
    { code: "a { color: red; -moz-transition: none }" },
    { code: "@font-face { font-weight: 100 400 }" },
    { code: "@media (min-width: 800px) { a { color: red; } }" },
    { code: "@media (foo) { a { color: red; } }" },
    { code: "@media (prefers-color-scheme: dark) { a { color: red; } }" },
    { code: "@supports (accent-color: auto) { a { accent-color: auto; } }" },
    { code: "@supports (accent-color: red) { a { accent-color: red; } }" },
    { code: "@supports (accent-color: auto) { a { accent-color: red; } }" },
    { code: "@supports (clip-path: fill-box) { a { clip-path: fill-box; } }" },
    {
      code: "@supports not (not (accent-color: auto)) { a { accent-color: auto; } }",
    },
    {
      code: stripIndent`
        @supports (accent-color: auto) and (backdrop-filter: auto) {
          a { accent-color: auto; backdrop-filter: auto }
        }
      `,
    },
    {
      code: stripIndent`
        @supports (accent-color: auto) {
          @supports (backdrop-filter: auto) {
            a { accent-color: auto; backdrop-filter: auto }
          }
        }
      `,
    },
    {
      code: stripIndent`
        @supports (accent-color: auto) {
          @supports (accent-color: auto) {
            a { accent-color: auto; }
          }
          a { accent-color: auto; }
        }
      `,
    },
    {
      code: stripIndent`
        @supports (width: abs(20% - 100px)) {
          a { width: abs(20% - 100px); }
        }
      `,
    },
    {
      code: stripIndent`
        @supports selector(:has()) {
          h1:has(+ h2) { color: red; }
        }
      `,
    },
    {
      code: "div { cursor: pointer; }",
      description: "See: https://github.com/eslint/css/pull/52",
    },
    {
      code: "pre { overflow: auto; }",
      description: "See https://github.com/eslint/css/issues/79",
    },
    {
      code: "dialog[open] { color: red; }",
      description: "attribute selectors are widely supported",
    },
    {
      code: ".foo { color: red; }",
      description: "class selectors are widely supported",
    },
    {
      code: "#foo { color: red; }",
      description: "id selectors are widely supported",
    },
    {
      code: "* { color: red; }",
      description: "universal selectors are widely supported",
    },
    {
      code: "div.foo#bar[attr] * { margin: 0; }",
      description: "combination of basic selectors are widely supported",
    },
  ],

  reject: [
    {
      code: "a { accent-color: red; backdrop-filter: auto }",
      warnings: [
        {
          message: messages.notBaselineProperty("accent-color", "widely"),
          line: 1,
          column: 5,
          endLine: 1,
          endColumn: 17,
        },
        {
          message: messages.notBaselineProperty("backdrop-filter", "widely"),
          line: 1,
          column: 24,
          endLine: 1,
          endColumn: 39,
        },
      ],
    },
    {
      code: "a { clip-path: stroke-box; }",
      message: messages.notBaselinePropertyValue(
        "clip-path",
        "stroke-box",
        "widely",
      ),
      line: 1,
      column: 16,
      endLine: 1,
      endColumn: 26,
    },
    {
      code: "a { color: abs(20% - 10px); }",
      message: messages.notBaselineFunction("abs", "widely"),
      line: 1,
      column: 12,
      endLine: 1,
      endColumn: 15,
    },
    {
      code: stripIndent`
        @property --foo {
          syntax: "*";
          inherits: false;
        }
      `,
      message: messages.notBaselineAtRule("@property", "widely"),
      line: 1,
      column: 1,
      endLine: 1,
      endColumn: 10,
    },
    {
      code: "@view-transition { navigation: auto; }",
      message: messages.notBaselineAtRule("@view-transition", "widely"),
      line: 1,
      column: 1,
      endLine: 1,
      endColumn: 17,
    },
    {
      code: "a { color: light-dark(black, white); }",
      message: messages.notBaselineFunction("light-dark", "widely"),
      line: 1,
      column: 12,
      endLine: 1,
      endColumn: 22,
    },
    {
      code: "@media (inverted-colors: inverted) { a { color: red; } }",
      message: messages.notBaselineMediaCondition("inverted-colors", "widely"),
      line: 1,
      column: 9,
      endLine: 1,
      endColumn: 24,
    },
    {
      code: "@media (height: 600px) and (inverted-colors: inverted) and (device-posture: folded) { a { color: red; } }",
      warnings: [
        {
          message: messages.notBaselineMediaCondition(
            "inverted-colors",
            "widely",
          ),
          line: 1,
          column: 29,
          endLine: 1,
          endColumn: 44,
        },
        {
          message: messages.notBaselineMediaCondition(
            "device-posture",
            "widely",
          ),
          line: 1,
          column: 61,
          endLine: 1,
          endColumn: 75,
        },
      ],
    },
    {
      code: "@media (foo) and (inverted-colors: inverted) { a { color: red; } }",
      message: messages.notBaselineMediaCondition("inverted-colors", "widely"),
      line: 1,
      column: 19,
      endLine: 1,
      endColumn: 34,
    },
    {
      code: "h1:has(+ h2) { margin: 0; }",
      message: messages.notBaselineSelector("has", "widely"),
      line: 1,
      column: 3,
      endLine: 1,
      endColumn: 7,
    },
    {
      code: "details::details-content { color: red; }",
      message: messages.notBaselineSelector("details-content", "widely"),
      line: 1,
      column: 8,
      endLine: 1,
      endColumn: 25,
    },
    {
      code: stripIndent`
        @supports (accent-color: auto) {
          @supports (backdrop-filter: auto) {
            a { accent-color: red; }
          }

          a { backdrop-filter: auto; }
        }
      `,
      message: messages.notBaselineProperty("backdrop-filter", "widely"),
      line: 6,
      column: 7,
      endLine: 6,
      endColumn: 22,
    },
    {
      code: "@supports (clip-path: fill-box) { a { clip-path: stroke-box; } }",
      message: messages.notBaselinePropertyValue(
        "clip-path",
        "stroke-box",
        "widely",
      ),
      line: 1,
      column: 50,
      endLine: 1,
      endColumn: 60,
    },
    {
      code: "@supports (accent-color: auto) { a { accent-color: abs(20% - 10px); } }",
      message: messages.notBaselineFunction("abs", "widely"),
      line: 1,
      column: 52,
      endLine: 1,
      endColumn: 55,
    },
    {
      code: "@supports not (accent-color: auto) { a { accent-color: auto } }",
      message: messages.notBaselineProperty("accent-color", "widely"),
      line: 1,
      column: 42,
      endLine: 1,
      endColumn: 54,
    },
    {
      code: stripIndent`
        @supports selector(:has()) {}

        @supports (color: red) {
          h1:has(+ h2) {
            color: red;
          }
        }
      `,
      warnings: [
        {
          message: messages.unnecessarySupports("(color: red)", "widely"),
          line: 3,
          column: 11,
          endLine: 3,
          endColumn: 23,
        },
        {
          message: messages.notBaselineSelector("has", "widely"),
          line: 4,
          column: 5,
          endLine: 4,
          endColumn: 9,
        },
      ],
    },
    {
      code: stripIndent`
        @supports (color: red) {
          /* a comment */
          a {
            accent-color: auto;
          }
        }
      `,
      warnings: [
        {
          message: messages.unnecessarySupports("(color: red)", "widely"),
          line: 1,
          column: 11,
          endLine: 1,
          endColumn: 23,
        },
        {
          message: messages.notBaselineProperty("accent-color", "widely"),
          line: 4,
          column: 5,
          endLine: 4,
          endColumn: 17,
        },
      ],
    },
  ],
});

testRule({
  plugins: [plugin],
  ruleName,
  config: [true, { available: "newly" }],

  accept: [
    { code: "a { backdrop-filter: auto }" },
    {
      code: stripIndent`
        @property --foo {
          syntax: "*";
          inherits: false;
        }
      `,
    },
  ],

  reject: [
    {
      code: "a { accent-color: red; backdrop-filter: auto }",
      message: messages.notBaselineProperty("accent-color", "newly"),
      line: 1,
      column: 5,
      endLine: 1,
      endColumn: 17,
    },
    {
      code: "@media (device-posture: folded) { a { color: red; } }",
      message: messages.notBaselineMediaCondition("device-posture", "newly"),
      line: 1,
      column: 9,
      endLine: 1,
      endColumn: 23,
    },
  ],
});

testRule({
  plugins: [plugin],
  ruleName,
  config: [true, { available: 2015 }],

  reject: [
    {
      code: "a { font-stretch: condensed; }",
      message: messages.notBaselineProperty("font-stretch", 2015),
      line: 1,
      column: 5,
      endLine: 1,
      endColumn: 17,
    },
  ],
});

testRule({
  plugins: [plugin],
  ruleName,
  config: [true, { available: 2021 }],

  reject: [
    {
      code: ".foo { backdrop-filter: blur(10px); }",
      message: messages.notBaselineProperty("backdrop-filter", 2021),
      line: 1,
      column: 8,
      endLine: 1,
      endColumn: 23,
    },
  ],
});

testRule({
  plugins: [plugin],
  ruleName,
  config: [true, { available: 2022 }],

  accept: [{ code: ".foo { overscroll-behavior: contain; }" }],

  reject: [
    {
      code: stripIndent`label {
        & input {
          border: red 2px dashed;
        }
      }`,
      message: messages.notBaselineSelector("nesting", 2022),
      line: 2,
      column: 9,
      endLine: 2,
      endColumn: 10,
    },
  ],
});

testRule({
  plugins: [plugin],
  ruleName,
  config: [true, { available: 2024 }],

  accept: [{ code: ".foo { backdrop-filter: blur(10px); }" }],
});

testRule({
  plugins: [plugin],
  ruleName,
  config: [
    true,
    {
      ignoreSelectors: ["nesting", "/^has/"],
    },
  ],

  accept: [
    {
      code: stripIndent`label {
        & input {
          border: red 2px dashed;
        }
      }`,
    },
    {
      code: "h1:has(+ h2) { margin: 0; }",
    },
    {
      code: "h1:has-slotted { color: red; }",
    },
  ],

  reject: [
    {
      code: "details::details-content { color: red; }",
      message: messages.notBaselineSelector("details-content", "widely"),
      line: 1,
      column: 8,
      endLine: 1,
      endColumn: 25,
    },
  ],
});

testRule({
  plugins: [plugin],
  ruleName,
  description: "ignoreProperties test",
  config: [
    true,
    {
      ignoreProperties: {
        // Empty array: skip property baseline check only (values are still checked)
        "accent-color": [],
        "/^animation-/": [],

        // Mix of string and regex values
        "clip-path": ["stroke-box", "/^fill-/"],

        // Regex for both key and values
        "/^break-/": ["/^avoid/"],

        // Ignore all values with regex
        "backdrop-filter": ["/^.+$/"],
      },
    },
  ],

  accept: [
    // Empty array behavior - property check skipped
    {
      code: "a { accent-color: red; }",
    },
    {
      code: "a { animation-composition: add; animation-range: normal; }",
    },

    // Mixed string and regex values
    {
      code: "a { clip-path: stroke-box; }",
    },
    {
      code: "a { clip-path: fill-box; }",
      description: "Value matches regex /^fill-/",
    },

    // Regex for both key and values
    {
      code: "a { break-after: avoid; }",
    },
    {
      code: "a { break-before: avoid-page; }",
    },
    {
      code: "a { break-inside: avoid-column; }",
    },

    // All values ignored with /^.+$/
    {
      code: "a { backdrop-filter: blur(10px); }",
    },
    {
      code: "a { backdrop-filter: none; }",
    },
  ],

  reject: [
    {
      code: "a { accent-color: auto; }",
      description: "Empty array: 'auto' is non-baseline value for accent-color",
      message: messages.notBaselinePropertyValue(
        "accent-color",
        "auto",
        "widely",
      ),
      line: 1,
      column: 19,
      endLine: 1,
      endColumn: 23,
    },
    {
      code: "a { clip-path: view-box; }",
      description: "Value 'view-box' doesn't match ignore patterns",
      message: messages.notBaselinePropertyValue(
        "clip-path",
        "view-box",
        "widely",
      ),
      line: 1,
      column: 16,
      endLine: 1,
      endColumn: 24,
    },
  ],
});

testRule({
  plugins: [plugin],
  ruleName,
  config: [
    true,
    {
      ignoreAtRules: ["view-transition", "/^font-/"],
    },
  ],

  accept: [
    {
      code: "@view-transition { navigation: auto; }",
    },
    {
      code: stripIndent`
        @font-feature-values Bungee {
          @styleset {
            nice-style: 12;
          }
        }
      `,
    },
    {
      code: stripIndent`
        @font-palette-values --foo {
          font-family: "Bungee";
          override-colors:
            0 red,
            1 blue;
        }
      `,
    },
  ],

  reject: [
    {
      code: stripIndent`
        @property --foo {
          syntax: "*";
          inherits: false;
        }
      `,
      message: messages.notBaselineAtRule("@property", "widely"),
      line: 1,
      column: 1,
      endLine: 1,
      endColumn: 10,
    },
  ],
});

testRule({
  plugins: [plugin],
  ruleName,
  config: [
    true,
    {
      ignoreFunctions: ["oklch", "/^light-/"],
    },
  ],

  accept: [
    {
      code: "a { color: oklch(0.5 0.2 120); }",
    },
    {
      code: "a { color: light-dark(black, white); }",
    },
  ],

  reject: [
    {
      code: "a { width: abs(20% - 10px); }",
      message: messages.notBaselineFunction("abs", "widely"),
      line: 1,
      column: 12,
      endLine: 1,
      endColumn: 15,
    },
  ],
});

// Tests for unnecessary @supports guards
testRule({
  plugins: [plugin],
  ruleName,
  config: true,

  accept: [
    {
      code: "@supports (accent-color: auto) { a { accent-color: auto; } }",
      description:
        "accent-color is not widely available, so @supports guard is necessary",
    },
    {
      code: "@supports not (color: red) { a { color: red; } }",
      description:
        "negated @supports guards are not checked for unnecessary guards",
    },
    {
      code: "@supports (transform: rotate(45deg) unknownFunc()) { a { color: red; } }",
      description:
        "Multiple functions where one is not baseline - should NOT warn about unnecessary @supports",
    },
  ],

  reject: [
    {
      code: "@supports (color: red) { a { color: red; } }",
      message: messages.unnecessarySupports("(color: red)", "widely"),
      line: 1,
      column: 11,
      endLine: 1,
      endColumn: 23,
    },
    {
      code: "@supports (display: flex) { a { display: flex; } }",
      message: messages.unnecessarySupports("(display: flex)", "widely"),
      line: 1,
      column: 11,
      endLine: 1,
      endColumn: 26,
    },
    {
      code: "@supports (width: calc(1px + 2px)) { a { width: calc(1px + 2px); } }",
      message: messages.unnecessarySupports(
        "(width: calc(1px + 2px))",
        "widely",
      ),
      line: 1,
      column: 11,
      endLine: 1,
      endColumn: 35,
    },
    {
      code: "@supports (transform: rotate(45deg) scale(2)) { a { color: red; } }",
      description: "Multiple functions that are all baseline",
      message: messages.unnecessarySupports(
        "(transform: rotate(45deg) scale(2))",
        "widely",
      ),
      line: 1,
      column: 11,
      endLine: 1,
      endColumn: 46,
    },
    {
      code: "@supports (background: linear-gradient(red, blue) url('image.png')) { a { color: red; } }",
      description: "Multiple values with mixed types (function and url)",
      message: messages.unnecessarySupports(
        "(background: linear-gradient(red, blue) url('image.png'))",
        "widely",
      ),
      line: 1,
      column: 11,
      endLine: 1,
      endColumn: 68,
    },
    {
      code: "@supports selector(:hover) { a:hover { color: red; } }",
      message: messages.unnecessarySupports("selector(:hover)", "widely"),
      line: 1,
      column: 11,
      endLine: 1,
      endColumn: 27,
    },
    {
      code: stripIndent`
        @supports (padding: 10px) and (margin: 10px) {
          a { padding: 10px; margin: 10px; }
        }
      `,
      warnings: [
        {
          message: messages.unnecessarySupports("(padding: 10px)", "widely"),
          line: 1,
          column: 11,
          endLine: 1,
          endColumn: 26,
        },
        {
          message: messages.unnecessarySupports("(margin: 10px)", "widely"),
          line: 1,
          column: 31,
          endLine: 1,
          endColumn: 45,
        },
      ],
    },
  ],
});

// Tests for unnecessary @supports guards with "newly" availability
testRule({
  plugins: [plugin],
  ruleName,
  config: [true, { available: "newly" }],

  accept: [
    {
      code: "@supports (accent-color: auto) { a { accent-color: auto; } }",
    },
  ],

  reject: [
    {
      code: "@supports (backdrop-filter: auto) { a { backdrop-filter: auto; } }",
      message: messages.unnecessarySupports("(backdrop-filter: auto)", "newly"),
      line: 1,
      column: 11,
      endLine: 1,
      endColumn: 34,
    },
  ],
});
