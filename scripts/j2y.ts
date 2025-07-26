#!/usr/bin/env node

import { type PathLike, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join } from "node:path";
import { cac } from "cac";
import { stringify as yamlStringify } from "yaml";

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
 * @param newExt - New extension (e.g., '.yaml')
 */
function generateOutputPath(inputPath: string, newExt: string): string {
	const dir = dirname(inputPath);
	const nameWithoutExt = basename(inputPath, extname(inputPath));
	return join(dir, nameWithoutExt + newExt);
}

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
	const inputPath = inputFile.toString();

	validateFileExtension(inputPath, [".json"]);
	if (outputFile) validateFileExtension(outputFile.toString(), [".yaml", ".yml"]);

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
		.option("-s, --save", "Save to file with same name but .yaml extension (ignored if -o is used)")
		.option("-m, --modeline", "Add YAML language server modeline comment if $schema exists")
		.action((input, options) => {
			let outputFile = options.output;

			if (!outputFile && options.save) {
				outputFile = generateOutputPath(input, ".yaml");
			}

			convertJsonFileToYaml(input, outputFile, options.modeline);
		})
		.example("j2y schema.json")
		.example("j2y -o schema.yaml schema.json")
		.example("j2y --save schema.json")
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

if (import.meta.url === `file://${process.argv[1]}`) {
	main();
}
