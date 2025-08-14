#!/usr/bin/env node

/**
 * Runs TypeScript code inspectors on all source files.
 * Automatically reads `tsconfig.json` at the current directory to find all source files,
 * however excludes `*.test.ts` files.
 *
 * Usage:
 *   node scripts/inspect-ts.ts
 */

import { readFile } from "node:fs/promises";
import { createAsAssertionInspector } from "./modules/ts/as-assertions.ts";
import { inspect } from "./modules/ts/node-inspector.ts";
import { parseAsTsFile } from "./modules/ts/ts-file.ts";
import { parseTsconfig } from "./modules/ts/tsconfig.ts";

async function main() {
	const srcFilePromises = parseTsconfig("tsconfig.json")
		.fileNames.filter((fileName) => {
			return fileName.endsWith(".ts") && !fileName.endsWith(".test.ts");
		})
		.map(async (path) => {
			const code = await readFile(path, "utf-8");
			return parseAsTsFile(path, code);
		});

	// Create all inspectors and run them together in a single inspect call
	inspect([createAsAssertionInspector()], srcFilePromises);
}

await main();
