import stylelint from "stylelint";

import {
  BASELINE_HIGH,
  BASELINE_LOW,
  properties,
} from "../data/baseline-data.js";

const {
  createPlugin,
  utils: { report, ruleMessages, validateOptions },
} = stylelint;

const ruleName = "plugin/no-baseline-unsupported";

const messages = ruleMessages(ruleName, {
  notBaselineProperty: (property, availability) =>
    `Property "${property}" is not a ${availability} available baseline feature.`,
});

const ruleFunction = (primary, secondaryOptions) => {
  return (root, result) => {
    if (!validateOptions(result, ruleName, { actual: primary })) return;

    const availability =
      secondaryOptions?.available === "newly" ? "newly" : "widely";
    const baselineLevel =
      availability === "widely" ? BASELINE_HIGH : BASELINE_LOW;

    root.walkDecls((decl) => {
      const prop = decl.prop;

      if (!properties.has(prop)) {
        return;
      }

      const propLevel = properties.get(prop);

      if (propLevel < baselineLevel) {
        report({
          message: messages.notBaselineProperty,
          messageArgs: [prop, availability],
          result,
          node: decl,
          word: prop,
        });
      }
    });
  };
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;

export default createPlugin(ruleName, ruleFunction);
