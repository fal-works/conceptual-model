#!/usr/bin/env node

import { type PathLike, readFileSync, writeFileSync } from "node:fs";
import { cac } from "cac";
import { stringify as yamlStringify } from "yaml";

/**
 * Converts a JSON file to YAML format.
 * @param inputFile - Path to the input JSON file
 * @param outputFile - Optional path to the output YAML file
 * @param modeline - Whether to add YAML language server modeline comment
 */
export function convertJsonFileToYaml(
	inputFile: PathLike,
	outputFile?: PathLike,
	modeline?: boolean,
): void {
	const jsonContent = readFileSync(inputFile, "utf-8");
	const jsonData = JSON.parse(jsonContent);

	let yamlOutput = yamlStringify(jsonData, {
		lineWidth: 0,
	});

	// Add modeline comment if requested and $schema exists
	if (modeline && jsonData.$schema && typeof jsonData.$schema === "string") {
		yamlOutput = `# yaml-language-server: $schema=${jsonData.$schema}\n${yamlOutput}`;
	}

	if (outputFile) {
		writeFileSync(outputFile, yamlOutput);
		console.log(`YAML written to: ${outputFile}`);
	} else {
		console.log(yamlOutput);
	}
}

/**
 * Main entry point for the JSON to YAML converter CLI.
 * Converts JSON files to YAML format with proper formatting.
 */
function main(): void {
	const cli = cac("j2y");

	cli
		.command("<input>", "Convert JSON file to YAML")
		.option("-o, --output <file>", "Output file path (optional, defaults to stdout)")
		.option("-m, --modeline", "Add YAML language server modeline comment if $schema exists")
		.action((input, options) => {
			try {
				convertJsonFileToYaml(input, options.output, options.modeline);
			} catch (error) {
				console.error("Error:", error instanceof Error ? error.message : String(error));
				process.exit(1);
			}
		})
		.example("j2y schema.json")
		.example("j2y -o schema.yaml schema.json")
		.example("j2y --modeline schema.json");

	cli.help();

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
}

main();
