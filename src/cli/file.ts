import { basename, dirname, extname, join } from "node:path";
import type { internal } from "../index.ts";

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
 * Detects input format from file extension.
 */
export function detectInputFormat(inputFile: string): internal.InputFileFormat {
	const ext = extname(inputFile).toLowerCase();

	switch (ext) {
		case ".yaml":
		case ".yml":
			return "yaml";
		case ".json":
			return "json";
		default:
			throw new Error(`Unsupported input format: ${ext}. Supported formats: .yaml, .yml, .json`);
	}
}
