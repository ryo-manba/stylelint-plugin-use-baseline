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

### `available`: `"widely" | "newly"` | `YYYY`

_Default_: `"widely"`

- `"widely"` (default) – Allows features supported in all Baseline browsers for at least 30 months.
- `"newly"` – Allows features supported in all Baseline browsers for less than 30 months. Limited availability features still trigger warnings.
- `YYYY` – Allows features that became Baseline newly available that year, or earlier. For example, `2023`.

### `ignoreSelectors`: `Array<string | RegExp>`

_Default_: `[]`

An array of selectors to ignore. Each item can be:

- A string for exact matches
- A regular expression (e.g., `/^has/`)

### `ignoreProperties`: `Array<string | RegExp>`

_Default_: `[]`

An array of properties to ignore. Each item can be:

- A string for exact matches
- A regular expression (e.g., `/^animation-/`)

### `ignoreAtRules`: `Array<string | RegExp>`

_Default_: `[]`

An array of at-rules to ignore. Each item can be:

- A string for exact matches
- A regular expression (e.g., `/^font-/`)

## Examples

```css
/* invalid - accent-color is not widely available */
a {
  accent-color: red;
}

/* valid - using @supports for accent-color */
@supports (accent-color: auto) {
  a {
    accent-color: auto;
  }
}

/* invalid - abs() is not widely available */
.box {
  width: abs(20% - 100px);
}

/* invalid - :has() is not widely available */
h1:has(+ h2) {
  margin: 0;
}

/* valid - @supports indicates limited availability */
@supports selector(:has()) {
  h1:has(+ h2) {
    margin: 0;
  }
}

/* invalid - property value doesn't match @supports indicator */
@supports (accent-color: auto) {
  a {
    accent-color: abs(20% - 10px); /* mismatch */
  }
}

/* invalid - device-posture is not widely available */
@media (device-posture: folded) {
  .foldable {
    padding: 1rem;
  }
}
```

## Prior art

[eslint/css use-baseline](https://github.com/eslint/css/blob/main/docs/rules/use-baseline.md)

## License

[MIT](LICENSE)
