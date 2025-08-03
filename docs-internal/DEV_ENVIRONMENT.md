# Development Environment

## Package Management

This project uses **pnpm** for dependency management.
However, scripts are run via `npm run` commands due to issues with `pnpm run` when invoked by Claude Code CLI on Windows.

## Tooling

- **TypeScript**: For all source code
- **biome**: Code quality checks (linting, formatting)
- **ts-unused-exports**: Detect unused exports
- **tsdown**: Build/bundle tool for TypeScript

## Directory Visibility

Some directories are gitignored but remain visible to Claude Code through `.ignore` file settings.

- `/dist/` – Build output (needed to verify compilation results)
- `/test-out/` – Test artifacts (useful for debugging test failures)
- `/local/`, `/tmp/` – Local and temporary workspace files
- `/docs-deps/` – Dependency documentation copied from `/node_modules/` for easier access
