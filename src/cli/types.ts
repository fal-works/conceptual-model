/**
 * CLI type definitions and interfaces for command processing.
 */
import type { FileFormatType } from "./file-sys/file-format.ts";

// Re-export types for convenience
export type { FileFormatType } from "./file-sys/file-format.ts";

export type ModelType = "class-model";

/**
 * Output strategy for file processing.
 * Replaces boolean flags with explicit strategy types.
 */
export type OutputStrategy =
	| "stdout"
	| { type: "specific-file"; path: string } // --output file.ext (single file)
	| { type: "save-in-place" } // --save (change extension)
	| { type: "output-directory"; path: string }; // --output dir/ (GLOB patterns)

/**
 * Raw command options from CLI parsing.
 * Contains unvalidated strings that need processing.
 */
export interface RawCommandOptions {
	/** Raw source format string from CLI */
	source?: string;
	/** Raw target format string from CLI */
	target?: string;
	/** Output file path or directory */
	output?: string;
	/** Whether to save output with appropriate extension */
	save?: boolean;
	/** Whether to automatically generate class labels */
	autoClassLabels?: boolean;
}

/**
 * Generic discriminated union for single/multiple file patterns.
 *
 * `type: "multiple"` does not imply that the files are 2 or more.
 * It indicates that the input is a pattern that can match multiple files.
 */
type FileProcessingInput<TFile> =
	| { type: "single"; file: TFile }
	| { type: "multiple"; files: TFile[] };

/**
 * Early stage: file paths from pattern expansion.
 */
export type InputPatternResult = FileProcessingInput<string>;

/**
 * Later stage: resolved input params with format detection.
 */
export type InputProcessingParams<TSourceType extends FileFormatType> = FileProcessingInput<
	InputParams<TSourceType>
>;

/**
 * Core output parameters, resolved once per command.
 * Contains required parameters that determine output behavior.
 */
export interface OutputParams<TTargetType extends FileFormatType> {
	/** Validated target format type (required) */
	targetType: TTargetType;
	/** Resolved output strategy */
	outputStrategy: OutputStrategy;
}

/**
 * Unresolved model-specific options from CLI parsing.
 * Contains optional parameters that modify model-specific behavior.
 * These options are resolved to specific types by model processors.
 */
export interface UnresolvedModelSpecificOptions {
	/** Whether to automatically generate class labels (class-model specific) */
	autoClassLabels?: boolean;
}

/**
 * Input parameters for a specific file.
 * Contains file-level parameters.
 */
export interface InputParams<TSourceType extends FileFormatType> {
	/** Input file path */
	filePath: string;
	/** Detected or explicit source format */
	sourceType: TSourceType;
}

/**
 * Transformer function that transforms content from source to target format.
 * Uses validated input params, output params, and unresolved model-specific options.
 * Resolution to specific option types happens inside the transformer function.
 */
export type FileTransformer<
	TSourceType extends FileFormatType,
	TTargetType extends FileFormatType,
> = (
	content: string,
	inputParams: InputParams<TSourceType>,
	outputParams: OutputParams<TTargetType>,
	modelOptions: UnresolvedModelSpecificOptions,
) => string;

/**
 * Common processing parameters resolved from raw command options.
 * Contains parameters shared across all model types before model-specific processing.
 */
export interface CommonProcessingParams {
	/** Validated output parameters */
	outputParams: OutputParams<FileFormatType>;
	/** Unresolved model-specific options */
	modelOptions: UnresolvedModelSpecificOptions;
	/** Input processing params with single/multiple discrimination */
	inputProcessingParams: InputProcessingParams<FileFormatType>;
}

/**
 * Result from model-specific processing.
 * Contains all parameters needed by the common orchestrator to call `processFiles`.
 */
export interface ModelSpecificResult<
	TSourceType extends FileFormatType,
	TTargetType extends FileFormatType,
> {
	/** Input processing params with single/multiple discrimination */
	inputProcessingParams: InputProcessingParams<TSourceType>;
	/** Output parameters with narrowed target type */
	outputParams: OutputParams<TTargetType>;
	/** Transformer function for content conversion */
	transformer: FileTransformer<TSourceType, TTargetType>;
	/** Unresolved model options (passed through to transformer) */
	modelOptions: UnresolvedModelSpecificOptions;
}
