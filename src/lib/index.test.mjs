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
  ],
});

testRule({
  plugins: [plugin],
  ruleName,
  config: [true, { available: "newly" }],
  accept: [],

  reject: [
    {
      code: "a { accent-color: bar; backdrop-filter: auto }",
      warnings: [
        {
          message: messages.notBaselineProperty("accent-color", "newly"),
          line: 1,
          column: 5,
          endLine: 1,
          endColumn: 17,
        },
      ],
    },
  ],
});
