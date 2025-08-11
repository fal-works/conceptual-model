import { existsSync, statSync } from "node:fs";
import { extname } from "node:path";
import { isValidValue } from "../api/internal.ts";
import type { FileFormatType } from "./file-sys/file-format.ts";
import { inferFormatFromExtension, VALID_FILE_FORMATS } from "./file-sys/file-format.ts";
import type {
	OutputParams,
	OutputStrategy,
	RawCommandOptions,
	UnresolvedModelSpecificOptions,
} from "./types.ts";

/**
 * Resolves output strategy from raw command options.
 * Converts boolean flags into explicit strategy types.
 */
function resolveOutputStrategy(options: RawCommandOptions): OutputStrategy {
	// Check if output is a directory
	if (options.output) {
		// Check if path exists and is directory, or ends with path separator
		const existsAndIsDirectory =
			existsSync(options.output) && statSync(options.output).isDirectory();
		const endsWithSeparator = options.output.endsWith("/") || options.output.endsWith("\\");

		// Also consider it a directory if it has no file extension
		// This handles cases like "test-out/glob-output" where the directory doesn't exist yet
		const hasNoExtension = !extname(options.output);

		const isDirectory = existsAndIsDirectory || endsWithSeparator || hasNoExtension;

		if (isDirectory) {
			return { type: "output-directory", path: options.output };
		} else {
			return { type: "specific-file", path: options.output };
		}
	}

	if (options.save) {
		return { type: "save-in-place" };
	}

	return "stdout";
}

/**
 * Validates target format string and creates core output parameters.
 * Can infer target type from output file extension if not explicitly provided.
 */
export function resolveOutputParams(options: RawCommandOptions): OutputParams<FileFormatType> {
	let targetType: FileFormatType;

	// Try to get target type from explicit option first
	if (options.target) {
		if (!isValidValue(VALID_FILE_FORMATS, options.target)) {
			throw new Error(
				`Invalid target format '${options.target}'. Valid formats: ${Array.from(VALID_FILE_FORMATS).join(", ")}`,
			);
		}
		targetType = options.target;
	} else {
		// Try to infer from output file extension
		let inferredType: FileFormatType | undefined;

		if (options.output && !options.output.endsWith("/") && !options.output.endsWith("\\")) {
			// It's a specific file, not a directory
			const ext = extname(options.output);
			inferredType = inferFormatFromExtension(ext);
		}

		if (inferredType) {
			targetType = inferredType;
		} else {
			throw new Error(
				"Target format must be specified (--target) or inferable from output file extension",
			);
		}
	}

	// Resolve output strategy
	const outputStrategy = resolveOutputStrategy(options);

	return {
		targetType,
		outputStrategy,
	};
}

/**
 * Extracts model-specific options from raw command options.
 * Used by model processors to get their specific configuration.
 */
export function extractModelSpecificOptions(
	options: RawCommandOptions,
): UnresolvedModelSpecificOptions {
	return {
		...(options.autoClassLabels !== undefined && { autoClassLabels: options.autoClassLabels }),
	};
}

/**
 * Validates source format string if provided.
 * Used for explicit source format validation.
 */
export function validateSourceFormat(source: string): FileFormatType {
	if (!isValidValue(VALID_FILE_FORMATS, source)) {
		throw new Error(
			`Invalid source format '${source}'. Valid formats: ${Array.from(VALID_FILE_FORMATS).join(", ")}`,
		);
	}
	return source;
}
