# stylelint-plugin-use-baseline

[![npm version][npm-version-img]][npm] [![npm downloads last month][npm-downloads-img]][npm]

Disallow CSS features not in [Baseline](https://web.dev/baseline).

![Example output](https://github.com/user-attachments/assets/8c66b5ce-ec20-4641-bec3-41b784244277)

## Installation

```shell
npm install stylelint-plugin-use-baseline --save-dev
```

> Note: stylelint is a peer dependency, so you need to install it as well.

## Usage

1. Create or update your Stylelint configuration file, for example `.stylelintrc.js`.
2. Add `"stylelint-plugin-use-baseline"` to the `plugins` array.
3. Enable the rule by adding `"plugin/use-baseline"` to your `rules`.

A minimal `.stylelintrc.js` might look like this:

```js
/** @type {import("stylelint").Config} */
export default {
  plugins: ["stylelint-plugin-use-baseline"],
  rules: {
    "plugin/use-baseline": [
      true,
      {
        // "widely" (default), "newly", or YYYY (e.g. 2023)
        available: "widely",
      },
    ],
  },
};
```

Run Stylelint in your project (e.g., `npx stylelint "src/**/*.css"`).

## Rule Details

This rule reports the following cases:

- CSS properties not in Baseline, unless enclosed in a `@supports` block.
- At-rules that aren't widely available.
- Media conditions inside `@media` that aren't widely available.
- CSS property values that aren't widely available or aren't enclosed in a `@supports` block (currently limited to identifiers only).
- CSS functions that aren't widely available.
- CSS pseudo-elements and pseudo-classes that aren't widely available.
- Unnecessary `@supports` blocks when all checked features are already available at the configured baseline level.

The data is sourced from [`web-features`](https://npmjs.com/package/web-features).

**Note:** Although `cursor` is not yet labeled as Baseline, it has broad support. By default, **this plugin does not flag `cursor`** because it is [expected to be added to Baseline soon](https://github.com/web-platform-dx/web-features/issues/1038).

## Options

### `true`

```json
{
  "plugin/use-baseline": true
}
```

The following patterns are considered problems:

```css
/* accent-color is not widely available */
a {
  accent-color: red;
}
```

```css
/* abs() is not widely available */
.box {
  width: abs(20% - 100px);
}
```

```css
/* :has() is not widely available */
h1:has(+ h2) {
  margin: 0;
}
```

```css
/* property value doesn't match @supports indicator */
@supports (accent-color: auto) {
  a {
    accent-color: abs(20% - 10px);
  }
}
```

```css
/* device-posture is not widely available */
@media (device-posture: folded) {
  a {
    color: red;
  }
}
```

```css
/* unnecessary @supports - display property and flex value are both widely available */
@supports (display: flex) {
  .container {
    display: flex;
  }
}
```

```css
/* unnecessary @supports - :hover selector is widely available */
@supports selector(:hover) {
  a:hover {
    color: red;
  }
}
```

The following patterns are _not_ considered problems:

```css
/* using @supports for accent-color */
@supports (accent-color: auto) {
  a {
    accent-color: auto;
  }
}
```

```css
/* @supports indicates limited availability */
@supports selector(:has()) {
  h1:has(+ h2) {
    margin: 0;
  }
}
```

```css
/* widely supported properties */
a {
  color: red;
  background-color: blue;
  transition: none;
}
```

## Optional secondary options

### `available`

Specify which level of Baseline availability to enforce.

- `"widely"` (default) – Allows features supported in all Baseline browsers for at least 30 months.
- `"newly"` – Allows features supported in all Baseline browsers for less than 30 months. Limited availability features still trigger warnings.
- `YYYY` – Allows features that became Baseline newly available that year, or earlier. For example, `2023`.

#### `"widely"` (default)

Allows features supported in all Baseline browsers for at least 30 months.

Given:

```json
{
  "plugin/use-baseline": [true, { "available": "widely" }]
}
```

#### `"newly"`

Allows features supported in all Baseline browsers for less than 30 months. Limited availability features still trigger warnings.

Given:

```json
{
  "plugin/use-baseline": [true, { "available": "newly" }]
}
```

The following patterns are _not_ considered problems:

```css
h1:has(+ h2) {
  margin: 0;
}
```

#### `YYYY`

Allows features that became Baseline newly available that year, or earlier. For example, `2023`.

Given:

```json
{
  "plugin/use-baseline": [true, { "available": 2023 }]
}
```

The following patterns are _not_ considered problems:

```css
div {
  @starting-style {
    opacity: 0;
  }
}
```

### `ignoreSelectors`

```json
{ "ignoreSelectors": ["array", "of", "selectors", "/regex/"] }
```

Given:

```json
{
  "plugin/use-baseline": [true, { "ignoreSelectors": ["nesting", "/^has/"] }]
}
```

The following patterns are _not_ considered problems:

```css
a {
  img {
    width: 100%;
  }
}
```

```css
h1:has(+ h2) {
  margin: 0;
}
```

```css
h1:has-slotted {
  color: red;
}
```

### `ignoreProperties`

```json
{ "ignoreProperties": ["array", "of", "properties", "/regex/"] }
```

Given:

```json
{
  "plugin/use-baseline": [
    true,
    { "ignoreProperties": ["accent-color", "/^animation-/"] }
  ]
}
```

The following patterns are _not_ considered problems:

```css
a {
  accent-color: red;
}
```

```css
div {
  animation-composition: add;
}
```

```css
div {
  animation-range: 20%;
}
```

### `ignoreAtRules`

```json
{ "ignoreAtRules": ["array", "of", "at-rules", "/regex/"] }
```

Given:

```json
{
  "plugin/use-baseline": [
    true,
    { "ignoreAtRules": ["view-transition", "/^font-/"] }
  ]
}
```

The following patterns are _not_ considered problems:

```css
@view-transition {
  navigation: auto;
}
```

```css
@font-feature-values Font One {
  @styleset {
    nice-style: 12;
  }
}
```

```css
@font-palette-values --foo {
  font-family: Bixa;
  override-colors:
    0 red,
    1 blue;
}
```

### `ignoreFunctions`

```json
{ "ignoreFunctions": ["array", "of", "functions", "/regex/"] }
```

Given:

```json
{
  "plugin/use-baseline": [true, { "ignoreFunctions": ["oklch", "/^light-/"] }]
}
```

The following patterns are _not_ considered problems:

```css
a {
  color: oklch(0.5 0.2 120);
}
```

```css
a {
  color: light-dark(black, white);
}
```

## Prior art

[eslint/css use-baseline](https://github.com/eslint/css/blob/main/docs/rules/use-baseline.md)

## License

[MIT](LICENSE)

[npm]: https://www.npmjs.com/package/stylelint-plugin-use-baseline
[npm-version-img]: https://img.shields.io/npm/v/stylelint-plugin-use-baseline.svg
[npm-downloads-img]: https://img.shields.io/npm/dm/stylelint-plugin-use-baseline.svg
