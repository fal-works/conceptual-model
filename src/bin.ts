#!/usr/bin/env node

import { createCLI } from "./cli/setup.ts";

try {
	const cli = createCLI();
	cli.parse();
} catch (error) {
	if (error instanceof Error) {
		console.error(`${error.name}:`, error.message);
	} else {
		console.error("Error:", String(error));
	}
	console.log();
	const cli = createCLI();
	cli.outputHelp();
	process.exit(1);
}
