import { stripIndent } from "common-tags";
import { testRule } from "stylelint-test-rule-node";

import plugin from "./index.mjs";

const {
  rule: { messages, ruleName },
} = plugin;

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
    { code: "a { color: red; -moz-transition: bar }" },
    { code: "@font-face { font-weight: 100 400 }" },
    { code: "@media (min-width: 800px) { a { color: red; } }" },
    { code: "@media (foo) { a { color: red; } }" },
    { code: "@media (prefers-color-scheme: dark) { a { color: red; } }" },
  ],

  reject: [
    {
      code: "a { accent-color: bar; backdrop-filter: auto }",
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
        "widely"
      ),
      line: 1,
      column: 16,
      endLine: 1,
      endColumn: 26,
    },
    {
      code: "a { color: abs(20% - 10px); }",
      message: messages.notBaselineType("abs", "widely"),
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
      message: messages.notBaselineAtRule("property", "widely"),
      line: 1,
      column: 1,
      endLine: 1,
      endColumn: 10,
    },
    {
      code: "@container (min-width: 800px) { a { color: red; } }",
      message: messages.notBaselineAtRule("container", "widely"),
      line: 1,
      column: 1,
      endLine: 1,
      endColumn: 11,
    },
    {
      code: "@view-transition { from-view: a; to-view: b; }",
      message: messages.notBaselineAtRule("view-transition", "widely"),
      line: 1,
      column: 1,
      endLine: 1,
      endColumn: 17,
    },
    {
      code: "@media (color-gamut: srgb) { a { color: red; } }",
      message: messages.notBaselineMediaCondition("color-gamut", "widely"),
      line: 1,
      column: 9,
      endLine: 1,
      endColumn: 20,
    },

    {
      code: "@media (height: 600px) and (color-gamut: srgb) and (device-posture: folded) { a { color: red; } }",
      warnings: [
        {
          message: messages.notBaselineMediaCondition("color-gamut", "widely"),
          line: 1,
          column: 29,
          endLine: 1,
          endColumn: 40,
        },
        {
          message: messages.notBaselineMediaCondition(
            "device-posture",
            "widely"
          ),
          line: 1,
          column: 53,
          endLine: 1,
          endColumn: 67,
        },
      ],
    },
    {
      code: "@media (foo) and (color-gamut: srgb) { a { color: red; } }",
      message: messages.notBaselineMediaCondition("color-gamut", "widely"),
      line: 1,
      column: 19,
      endLine: 1,
      endColumn: 30,
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
      code: "a { accent-color: bar; backdrop-filter: auto }",
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
