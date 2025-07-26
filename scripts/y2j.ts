#!/usr/bin/env node

import { type PathLike, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join } from "node:path";
import { cac } from "cac";
import { parse as yamlParse } from "yaml";

/**
 * Validates that the file has the expected extension(s).
 * @param filePath - Path to validate
 * @param expectedExts - Expected file extensions (e.g., ['.json'] or ['.yaml', '.yml'])
 */
function validateFileExtension(filePath: string, expectedExts: string[]): void {
	const actualExt = extname(filePath).toLowerCase();
	if (!expectedExts.includes(actualExt)) {
		const expectedList = expectedExts.length === 1 ? expectedExts[0] : expectedExts.join(" or ");
		throw new Error(`Expected ${expectedList} file, but got ${actualExt || "no extension"}`);
	}
}

/**
 * Generates output file path by changing extension.
 * @param inputPath - Input file path
 * @param newExt - New extension (e.g., '.json')
 */
function generateOutputPath(inputPath: string, newExt: string): string {
	const dir = dirname(inputPath);
	const nameWithoutExt = basename(inputPath, extname(inputPath));
	return join(dir, nameWithoutExt + newExt);
}

/**
 * Converts a YAML file to JSON format.
 * @param inputFile - Path to the input YAML file
 * @param outputFile - Optional path to the output JSON file
 */
export function convertYamlFileToJson(inputFile: PathLike, outputFile?: PathLike): void {
	const inputPath = inputFile.toString();

	validateFileExtension(inputPath, [".yaml", ".yml"]);
	if (outputFile) validateFileExtension(outputFile.toString(), [".json"]);

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
		.option("-s, --save", "Save to file with same name but .json extension (ignored if -o is used)")
		.action((input, options) => {
			let outputFile = options.output;

			if (!outputFile && options.save) {
				outputFile = generateOutputPath(input, ".json");
			}

			convertYamlFileToJson(input, outputFile);
		})
		.example("y2j schema.yaml")
		.example("y2j -o schema.json schema.yaml")
		.example("y2j --save schema.yaml");

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

if (import.meta.url === `file://${process.argv[1]}`) {
	main();
}
