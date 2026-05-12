# Contributing

Thanks for your interest in contributing!

## Setup

This project uses [pnpm](https://pnpm.io/) (pinned via `packageManager` in `package.json`). Node.js 22+ is required.

```sh
pnpm install
```

## Common tasks

```sh
pnpm test           # run the Jest test suite
pnpm watch          # run tests in watch mode
pnpm run lint       # run ESLint
pnpm run format     # run Prettier
pnpm run build      # build dist/ with Rollup
pnpm run validate   # lint + test
```

## Updating baseline data

`src/data/baseline-data.js` is auto-generated from the `web-features` and `mdn-data` packages. After bumping either dependency, regenerate:

```sh
pnpm run build:baseline
```

Updates are normally proposed automatically by the scheduled `Update Baseline` GitHub Action.

## Pull requests

- Open an issue first for non-trivial changes.
- Keep PRs focused. Add or update tests in `src/lib/index.test.js`.
- Ensure `pnpm run validate` passes locally.
