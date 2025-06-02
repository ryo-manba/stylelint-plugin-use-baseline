# stylelint-plugin-use-baseline

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
        // "widely" (default), "newly", or a year (e.g. 2023)
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

The data is sourced from [`web-features`](https://npmjs.com/package/web-features).

### Note

Although `cursor` is not yet labeled as Baseline, it has broad support. By default, **this plugin does not flag `cursor`** because it is [expected to be added to Baseline soon](https://github.com/web-platform-dx/web-features/issues/1038).

## Options

`true`

```json
{
  "plugin/use-baseline": true
}
```

The following pattern is considered a problem:

```css
/* accent-color is not widely available */
a {
  accent-color: red;
}

/* abs() is not widely available */
.box {
  width: abs(20% - 100px);
}

/* :has() is not widely available */
h1:has(+ h2) {
  margin: 0;
}

/* property value doesn't match @supports indicator */
@supports (accent-color: auto) {
  a {
    accent-color: abs(20% - 10px); /* mismatch */
  }
}

/* device-posture is not widely available */
@media (device-posture: folded) {
  .foldable {
    padding: 1rem;
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

/* @supports indicates limited availability */
@supports selector(:has()) {
  h1:has(+ h2) {
    margin: 0;
  }
}
```

## Optional secondary options

### `available`

```json
{ "available": `"widely" | "newly"` | `YYYY` }
```

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
  color: green;
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
  "plugin/use-baseline": [true, { "ignoreAtRules": ["container", "/^font-/"] }]
}
```

The following patterns are _not_ considered problems:

```css
@container (min-width: 800px) {
  a {
    color: red;
  }
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
@font-palette-values --Alternate {
  font-family: "Bungee Spice";
  override-colors:
    0 #00ffbb,
    1 #007744;
}
```

## Prior art

[eslint/css use-baseline](https://github.com/eslint/css/blob/main/docs/rules/use-baseline.md)

## License

[MIT](LICENSE)
