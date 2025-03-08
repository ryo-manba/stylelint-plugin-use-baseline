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
  selectors,
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
  notBaselineSelector: (selectorName, availability) =>
    `Selector "${selectorName}" is not a ${availability} available baseline feature.`,
});

const ruleFunction = (primary, secondaryOptions) => {
  return (root, result) => {
    if (!validateOptions(result, ruleName, { actual: primary })) return;

    const availability =
      secondaryOptions?.available === "newly" ? "newly" : "widely";
    const baselineLevel =
      availability === "widely" ? BASELINE_HIGH : BASELINE_LOW;

    root.walk((node) => {
      switch (node.type) {
        case "atrule": {
          handleAtRule(node);
          break;
        }
        case "rule": {
          handleRule(node);
          break;
        }
        case "decl": {
          handleDeclaration(node);
          break;
        }
      }
    });

    /**
     * @param {import('postcss').Rule} node
     * @returns {void}
     */
    function handleAtRule(node) {
      const { name } = node;

      if (name === "media") {
        checkMediaConditions(node);

        return;
      }

      if (!atRules.has(name)) return;

      const atRuleLevel = atRules.get(name);

      if (atRuleLevel < baselineLevel) {
        report({
          message: messages.notBaselineAtRule,
          messageArgs: [name, availability],
          result,
          node,
          index: 0,
          endIndex: name.length + 1,
        });
      }
    }

    /**
     * @param {import('postcss').Declaration} decl
     * @returns {void}
     */
    function handleDeclaration(decl) {
      const { prop, value } = decl;

      checkBaselineProperty(decl, prop);

      const parsed = valueParser(value);

      parsed.walk((node) => {
        if (node.type === "word") {
          checkPropertyValueIdentifier(decl, prop, node.value);
        } else if (node.type === "function") {
          checkPropertyValueFunction(decl, node.value);
        }
      });
    }

    /**
     * @param {import('postcss').Rule} ruleNode
     * @returns {void}
     */
    function handleRule(ruleNode) {
      const { selector } = ruleNode;

      try {
        const ast = parse(selector, {
          context: "selectorList",
          positions: true,
        });

        walk(ast, (node) => {
          const selectorName = node.name;

          if (!selectors.has(selectorName)) return;

          const selectorLevel = selectors.get(selectorName);

          if (selectorLevel < baselineLevel) {
            // some selectors are prefixed with the : or :: symbols
            let prefixSymbolLength = 0;

            if (node.type === "PseudoClassSelector") {
              prefixSymbolLength = 1;
            } else if (node.type === "PseudoElementSelector") {
              prefixSymbolLength = 2;
            }

            const index = node.loc.start.offset;
            const endIndex = index + selectorName.length + prefixSymbolLength;

            report({
              ruleName,
              result,
              message: messages.notBaselineSelector(selectorName, availability),
              node: ruleNode,
              index,
              endIndex,
            });
          }
        });
      } catch {
        // Ignore invalid selectors
      }
    }

    /**
     * Checks a property against baseline compatibility
     * @param {import('postcss').Declaration} decl
     * @param {string} property
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
     * Checks a property value against baseline compatibility data.
     * @param {import('postcss').Declaration} decl
     * @param {string} property
     * @param {string} value
     * @returns {void}
     */
    function checkPropertyValueIdentifier(decl, property, value) {
      // named colors are always valid
      if (namedColors.has(value)) return;

      if (!propertyValues.has(property)) return;

      const possiblePropertyValues = propertyValues.get(property);

      if (!possiblePropertyValues.has(value)) return;

      const propertyValueLevel = possiblePropertyValues.get(value);

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
     * Checks a function type against baseline compatibility data.
     * @param {import('postcss').Declaration} decl
     * @param {string} funcName
     */
    function checkPropertyValueFunction(decl, funcName) {
      if (!types.has(funcName)) return;

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

    /**
     * Checks media conditions against baseline compatibility data.
     * @param {import('postcss').AtRule} atRule
     */
    function checkMediaConditions(atRule) {
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

            if (!mediaConditions.has(featureName)) return;

            const featureLevel = mediaConditions.get(featureName);

            if (featureLevel < baselineLevel) {
              const atRuleIndex = atRuleParamIndex(atRule);

              const index = node.loc.start.column;
              const endIndex = index + featureName.length;

              report({
                ruleName,
                result,
                message: messages.notBaselineMediaCondition(
                  featureName,
                  availability
                ),
                node: atRule,
                index: atRuleIndex + index,
                endIndex: atRuleIndex + endIndex,
              });
            }
          }
        });
      } catch {
        // Ignore invalid media queries
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
