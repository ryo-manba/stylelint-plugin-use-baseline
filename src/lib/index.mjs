import { parse, walk } from "css-tree";
import stylelint from "stylelint";
import valueParser from "postcss-value-parser";

import {
  BASELINE_HIGH,
  BASELINE_LOW,
  atRules,
  mediaConditions,
  properties,
  propertyValues,
  types,
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
  notBaselineType: (type, availability) =>
    `Type "${type}" is not a ${availability} available baseline feature.`,
  notBaselineAtRule: (atRule, availability) =>
    `At-rule "${atRule}" is not a ${availability} available baseline feature.`,
  notBaselineMediaCondition: (condition, availability) =>
    `Media condition "${condition}" is not a ${availability} available baseline feature.`,
  // TODO: add selector message
});

const ruleFunction = (primary, secondaryOptions) => {
  return (root, result) => {
    if (!validateOptions(result, ruleName, { actual: primary })) return;

    const availability =
      secondaryOptions?.available === "newly" ? "newly" : "widely";
    const baselineLevel =
      availability === "widely" ? BASELINE_HIGH : BASELINE_LOW;

    // Check declarations: property, property value, etc.
    root.walkDecls((decl) => {
      const { prop, value } = decl;

      checkBaselineProperty(decl, prop);

      const parsed = valueParser(value);

      parsed.walk((node) => {
        if (node.type === "word") {
          checkPropertyValueIdentifier(decl, prop, value);
        } else if (node.type === "function") {
          checkPropertyValueFunction(decl, node.value);
        }
      });
    });

    // Check at-rules (e.g. @container, @property)
    root.walkAtRules((atRule) => {
      const { name } = atRule;

      // If the atRule name is not in the baseline data, skip
      if (!atRules.has(name)) {
        return;
      }

      const atRuleLevel = atRules.get(name);

      if (atRuleLevel < baselineLevel) {
        report({
          message: messages.notBaselineAtRule,
          messageArgs: [name, availability],
          result,
          node: atRule,
          index: 0,
          endIndex: name.length + 1,
        });
      }
    });

    // Check media conditions
    root.walkAtRules(/^media$/i, (atRule) => {
      if (atRule.name !== "media") return;

      const rawParams = atRule.params;

      try {
        const ast = parse(rawParams, {
          context: "atrulePrelude",
          atrule: "media",
          parseAtrulePrelude: true,
          positions: true,
        });

        walk(ast, (node) => {
          if (node.type === "Feature") {
            const featureName = node.name;

            if (mediaConditions.has(featureName)) {
              const featureLevel = mediaConditions.get(featureName);

              if (featureLevel < baselineLevel) {
                const atRuleIndex = atRuleParamIndex(atRule);

                const startIndex = node.loc.start.column;
                const endIndex = startIndex + featureName.length;

                report({
                  ruleName,
                  result,
                  message: messages.notBaselineMediaCondition(
                    featureName,
                    availability
                  ),
                  node: atRule,
                  index: atRuleIndex + startIndex,
                  endIndex: atRuleIndex + endIndex,
                });
              }
            }
          }
        });
      } catch {
        // Ignore invalid media queries
      }
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

    /**
     * Checks a property value function to see if it's a baseline feature.
     * @param {import('postcss').Declaration} decl
     * @param {string} funcName
     */
    function checkPropertyValueFunction(decl, funcName) {
      if (!types.has(funcName)) {
        return;
      }

      const propertyValueLevel = types.get(funcName);

      if (propertyValueLevel < baselineLevel) {
        report({
          message: messages.notBaselineType,
          messageArgs: [funcName, availability],
          result,
          node: decl,
          word: funcName,
        });
      }
    }
  };
};

/**
 * @param {AtRule} atRule
 * @returns {number}
 */
function atRuleParamIndex(atRule) {
  const index = 1 + atRule.name.length;

  return index + (atRule.raws.afterName?.length ?? 0);
}

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;

export default createPlugin(ruleName, ruleFunction);
