#!/usr/bin/env node

/**
 * CLI executable entry point for conceptual model toolkit.
 */

import { createCLI } from "./cli/setup.ts";

const cli = createCLI();

try {
	cli.parse();
} catch (error) {
	if (error instanceof Error) {
		console.error(`${error.name}:`, error.message);
	} else {
		console.error("Error:", String(error));
	}
	console.log();
	cli.outputHelp();
	process.exit(1);
}
