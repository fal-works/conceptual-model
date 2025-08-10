import { glob } from "node:fs/promises";
import { basename, dirname, extname, join, normalize } from "node:path";
import type { FileFormatType, InputPatternResult, OutputParams } from "../types.ts";
import { getFormatExtension } from "./file-format.ts";

/**
 * Validates that the file has the expected extension(s).
 */
export function validateFileExtension(filePath: string, expectedExts: string[]): void {
	const actualExt = extname(filePath).toLowerCase();
	if (!expectedExts.includes(actualExt)) {
		const expectedList = expectedExts.length === 1 ? expectedExts[0] : expectedExts.join(" or ");
		throw new Error(`Expected ${expectedList} file, but got ${actualExt || "no extension"}`);
	}
}

/**
 * Changes file extension.
 */
export function changeExtension(path: string, newExt: string): string {
	const dir = dirname(path);
	const nameWithoutExt = basename(path, extname(path));
	return join(dir, nameWithoutExt + newExt);
}

/**
 * Expands input pattern to list of files using discriminated union.
 * Uses filesystem expansion to determine user intent: if the pattern expands to
 * exactly one file and that file equals the input pattern, it's a direct file.
 * Otherwise, it's considered a glob pattern.
 */
export async function expandInputPattern(pattern: string): Promise<InputPatternResult> {
	const matches = [];
	for await (const match of glob(pattern)) {
		matches.push(match);
	}

	// If it matches exactly one file and that file equals the input pattern,
	// then the user specified a direct file path
	// Normalize paths for comparison to handle different path separators
	if (matches.length === 1 && normalize(matches[0]) === normalize(pattern)) {
		return {
			type: "single",
			file: matches[0],
		};
	}

	// Otherwise, it's a glob pattern (0 matches, multiple matches, or different path)
	return {
		type: "multiple",
		files: matches,
	};
}

/**
 * Determines output path based on output strategy and input filepath.
 * Handles different output strategies with proper path resolution.
 */
export function determineOutputPath(
	inputFilePath: string,
	outputParams: OutputParams<FileFormatType>,
): string | undefined {
	const strategy = outputParams.outputStrategy;

	if (strategy === "stdout") {
		return undefined;
	}

	if (strategy.type === "specific-file") {
		return strategy.path;
	}

	if (strategy.type === "save-in-place") {
		const targetExt = getFormatExtension(outputParams.targetType);
		return changeExtension(inputFilePath, targetExt);
	}

	if (strategy.type === "output-directory") {
		const targetExt = getFormatExtension(outputParams.targetType);
		const fileName = changeExtension(basename(inputFilePath), targetExt);
		return join(strategy.path, fileName);
	}

	// Type safety: this should never happen with proper typing
	throw new Error(`Unknown output strategy: ${JSON.stringify(strategy)}`);
}
