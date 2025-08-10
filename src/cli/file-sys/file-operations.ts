import { readFileSync, writeFileSync } from "node:fs";
import type { OutputStrategy } from "../types.ts";

/**
 * Reads input file content.
 * Pure function that reads file without side effects beyond file I/O.
 */
export function readInputFile(inputFile: string): string {
	return readFileSync(inputFile, "utf-8");
}

/**
 * Writes transformed content using output strategy.
 * Handles different output strategies with explicit strategy pattern.
 */
export function writeOutputWithStrategy(
	content: string,
	inputFile: string,
	outputPath: string | undefined,
	_strategy: OutputStrategy,
): void {
	if (outputPath) {
		// Write to file
		writeFileSync(outputPath, content);
		console.log(`Transformed ${inputFile} -> ${outputPath}`);
	} else {
		// Output to stdout (when outputPath is undefined)
		console.log(content);
	}
}
