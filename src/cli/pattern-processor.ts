import { mkdirSync } from "node:fs";
import { glob } from "node:fs/promises";
import { basename, join } from "node:path";
import type { ModelType, OutputTargetType } from "../api/internal.ts";
import { changeExtension, validateFileExtension } from "./file.ts";
import { transformFileToFile } from "./file-to-file.ts";

/**
 * Common options interface for transformation commands.
 */
interface TransformationOptions {
	output?: string;
	save?: boolean;
	autoLabels?: boolean;
}

/**
 * Processes input pattern (single file or glob) and transforms matching files.
 */
export async function processInputPattern(
	pattern: string,
	options: TransformationOptions,
	modelType: ModelType,
	outputTarget: OutputTargetType,
): Promise<void> {
	// Detect if user intended glob pattern based on syntax
	const isGlobPattern = /[*?[\]{}]/.test(pattern);

	// Expand pattern to get list of matching files
	const files = await expandInputPattern(pattern);

	// If no files match, inform user and return
	if (files.length === 0) {
		console.log(`No files found matching pattern: ${pattern}`);
		return;
	}

	// Handle based on user intent (glob pattern vs single file)
	if (isGlobPattern) {
		// Glob pattern case - validate output options
		if (!options.output && !options.save) {
			throw new Error(
				"When using glob patterns, you must specify either --output (directory) or --save option.",
			);
		}

		// If output is specified, treat it as directory for glob patterns
		if (options.output) {
			// Create output directory if it doesn't exist
			mkdirSync(options.output, { recursive: true });

			// Process each file with output directory
			for (const file of files) {
				const outputFileName = changeExtension(basename(file), getOutputExtension(outputTarget));
				const outputFile = join(options.output, outputFileName);

				transformFileToFile(file, { output: outputFile }, modelType, outputTarget);
			}
		} else {
			// Use --save behavior for each file
			for (const file of files) {
				transformFileToFile(file, { save: true }, modelType, outputTarget);
			}
		}
	} else {
		// Single file case - preserve existing behavior
		transformFileToFile(files[0], options, modelType, outputTarget);
	}
}

/**
 * Expands input pattern to list of files, handling both single files and glob patterns.
 */
async function expandInputPattern(pattern: string): Promise<string[]> {
	// Check if pattern contains glob characters
	const hasGlobChars = /[*?[\]{}]/.test(pattern);

	if (hasGlobChars) {
		// Try to expand as glob pattern
		const matches = [];
		try {
			for await (const match of glob(pattern)) {
				matches.push(match);
			}
		} catch (_error: unknown) {
			// If glob fails but it looks like a glob pattern, return empty
			return [];
		}

		// If glob found matches, validate they have supported extensions
		if (matches.length > 0) {
			const supportedExtensions = [".yaml", ".yml", ".json"];
			for (const match of matches) {
				try {
					validateFileExtension(match, supportedExtensions);
				} catch (error) {
					throw new Error(
						`File ${match} has unsupported extension. ${error instanceof Error ? error.message : String(error)}`,
					);
				}
			}
			return matches;
		}

		// If no matches found for glob pattern, return empty array
		return [];
	} else {
		// Not a glob pattern, treat as single file path
		return [pattern];
	}
}

/**
 * Gets the output file extension for the given output target.
 */
function getOutputExtension(outputTarget: OutputTargetType): string {
	switch (outputTarget) {
		case "mermaid":
			return ".mermaid";
		default:
			return ".out";
	}
}
