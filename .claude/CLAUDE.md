# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# @infinitetoken/eslint-config

Shared ESLint (flat config) and Prettier rules for InfiniteToken TypeScript packages. Part of the `@infinitetoken` shared tooling scope, alongside `@infinitetoken/tsconfig` (`../TSConfig`).

## Commands

```bash
npm run lint   # ESLint check
npm run fix    # Auto-fix lint/format issues
npm test       # Verify every preset resolves and loads correctly
npm run ci     # lint + test
```

## Release

Tag-based, using npm trusted publishing (OIDC, no token required):

```bash
npm version patch   # or minor / major
git push --follow-tags
```

The `publish.yml` workflow fires on `v*` tags and runs `npm publish`.

## Presets

| Export | Use for |
| --- | --- |
| `.` | Universal core; rarely used directly |
| `./npm-package` | Published npm packages with no RN/server specifics (kits, Node plugins) |
| `./react-native` | React Native packages |
| `./server` | Express/server apps (unpublished) |
| `./prettier` | Shared Prettier rules object |

Each preset composes the one below it (`react-native.cjs` requires `npm-package.cjs`, which requires `index.cjs`). Repo-specific overrides belong in the consuming repo's own `eslint.config.cjs`, composed via `defineConfig([...require(...), { ... }])`; never add repo-specific rules here.

`eslint-plugin-react-hooks` and `eslint-plugin-react-native` are optional peer dependencies, not bundled dependencies, since `eslint-plugin-react-native@5` only supports `eslint` up to v9, and bundling it would force that ceiling onto every consumer, not just React Native ones.

## Code Style

This repo dogfoods itself: root `eslint.config.cjs` and `prettier.config.cjs` both `require()` this package's own `npm-package.cjs`/`prettier.cjs` by relative path. Always run `npm run lint` before finishing any task.

Single quotes, JSX single quotes, no semicolons, no trailing commas, print width 1000 (effectively disabled).
