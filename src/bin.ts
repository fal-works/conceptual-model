#!/usr/bin/env node

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
