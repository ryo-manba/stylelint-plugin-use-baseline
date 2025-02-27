import stylelint from "stylelint";

import {
  BASELINE_HIGH,
  BASELINE_LOW,
  properties,
  propertyValues,
} from "../data/baseline-data.js";
import { namedColors } from "../data/colors.js";

const {
  createPlugin,
  utils: { report, ruleMessages, validateOptions },
} = stylelint;

const ruleName = "plugin/no-baseline-unsupported";

const messages = ruleMessages(ruleName, {
  notBaselineProperty: (property, availability) =>
    `Property "${property}" is not a ${availability} available baseline feature.`,
  notBaselinePropertyValue: (property, value, availability) =>
    `Value "${value}" of property "${property}" is not a ${availability} available baseline feature.`,
});

const ruleFunction = (primary, secondaryOptions) => {
  return (root, result) => {
    if (!validateOptions(result, ruleName, { actual: primary })) return;

    const availability =
      secondaryOptions?.available === "newly" ? "newly" : "widely";
    const baselineLevel =
      availability === "widely" ? BASELINE_HIGH : BASELINE_LOW;

    root.walkDecls((decl) => {
      const { prop, value } = decl;

      checkBaselineProperty(decl, prop);
      checkPropertyValueIdentifier(decl, prop, value);
    });

    /**
     * Checks if a property is listed in Baseline data and meets the required level.
     * @param {import('postcss').Declaration} decl - PostCSS declaration node.
     * @param {string} property - The property name.
     * @returns {void}
     */
    function checkBaselineProperty(decl, property) {
      // If the property is not in the Baseline data, skip
      if (!properties.has(property)) {
        return false;
      }

      const propLevel = properties.get(property);

      if (propLevel < baselineLevel) {
        report({
          message: messages.notBaselineProperty,
          messageArgs: [property, availability],
          result,
          node: decl,
          word: property,
        });
      }
    }

    /**
     * Checks a property value identifier to see if it's a baseline feature.
     * @param {import('postcss').Declaration} decl - PostCSS declaration node.
     * @param {string} property - The property name.
     * @param {string} value - The property value.
     * @returns {void}
     */
    function checkPropertyValueIdentifier(decl, property, value) {
      // named colors are always valid
      if (namedColors.has(value)) {
        return;
      }

      const possiblePropertyValues = propertyValues.get(property);

      if (!possiblePropertyValues) {
        return;
      }

      const propertyValueLevel = possiblePropertyValues.get(value);

      // Skip if unknown in the data
      if (propertyValueLevel === undefined) {
        return;
      }

      if (propertyValueLevel < baselineLevel) {
        report({
          message: messages.notBaselinePropertyValue,
          messageArgs: [property, value, availability],
          result,
          node: decl,
          word: value,
        });
      }
    }
  };
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;

export default createPlugin(ruleName, ruleFunction);
