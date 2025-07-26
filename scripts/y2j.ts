#!/usr/bin/env node

import { type PathLike, readFileSync, writeFileSync } from "node:fs";
import { cac } from "cac";
import { parse as yamlParse } from "yaml";

/**
 * Converts a YAML file to JSON format.
 * @param inputFile - Path to the input YAML file
 * @param outputFile - Optional path to the output JSON file
 */
export function convertYamlFileToJson(
	inputFile: PathLike,
	outputFile?: PathLike,
): void {
	const yamlContent = readFileSync(inputFile, "utf-8");
	const yamlData = yamlParse(yamlContent);

	const jsonOutput = JSON.stringify(yamlData, null, "\t");

	if (outputFile) {
		writeFileSync(outputFile, jsonOutput);
		console.log(`JSON written to: ${outputFile}`);
	} else {
		console.log(jsonOutput);
	}
}

/**
 * Main entry point for the YAML to JSON converter CLI.
 * Converts YAML files to JSON format with proper formatting.
 */
function main(): void {
	const cli = cac("y2j");

	cli
		.command("<input>", "Convert YAML file to JSON")
		.option("-o, --output <file>", "Output file path (optional, defaults to stdout)")
		.action((input, options) => {
			try {
				convertYamlFileToJson(input, options.output);
			} catch (error) {
				console.error("Error:", error instanceof Error ? error.message : String(error));
				process.exit(1);
			}
		})
		.example("y2j schema.yaml")
		.example("y2j -o schema.json schema.yaml");

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