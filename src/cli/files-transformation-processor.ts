/**
 * File processing and transformation execution.
 */
import { mkdirSync } from "node:fs";
import { readInputFile, writeOutputWithStrategy } from "./file-sys/file-operations.ts";
import { determineOutputPath } from "./file-sys/file-path.ts";
import type {
	FileFormatType,
	FileTransformer,
	InputParams,
	ModelSpecificResult,
	OutputParams,
	UnresolvedModelSpecificOptions,
} from "./types.ts";

/**
 * Processes a single file with the given transformer.
 */
async function processSingleFile<
	TSourceType extends FileFormatType,
	TTargetType extends FileFormatType,
>(
	inputParam: InputParams<TSourceType>,
	outputParams: OutputParams<TTargetType>,
	transformer: FileTransformer<TSourceType, TTargetType>,
	modelOptions: UnresolvedModelSpecificOptions,
): Promise<void> {
	// Read input file
	const content = readInputFile(inputParam.filePath);

	// Transform content
	const transformedContent = transformer(content, inputParam, outputParams, modelOptions);

	// Determine output path and write
	const outputPath = determineOutputPath(inputParam.filePath, outputParams);
	writeOutputWithStrategy(
		transformedContent,
		inputParam.filePath,
		outputPath,
		outputParams.outputStrategy,
	);
}

/**
 * Processes multiple files with the given transformer.
 * Calls processSingleFile for each file and provides summary.
 */
async function processMultipleFiles<
	TSourceType extends FileFormatType,
	TTargetType extends FileFormatType,
>(
	inputParams: InputParams<TSourceType>[],
	outputParams: OutputParams<TTargetType>,
	transformer: FileTransformer<TSourceType, TTargetType>,
	modelOptions: UnresolvedModelSpecificOptions,
): Promise<void> {
	// Validate output strategy for multi-file processing
	if (outputParams.outputStrategy === "stdout") {
		throw new Error(
			"When using glob patterns, you must specify either --output (directory) or --save option.",
		);
	}

	// Create output directory if needed
	if (outputParams.outputStrategy.type === "output-directory") {
		mkdirSync(outputParams.outputStrategy.path, { recursive: true });
	}

	// Process each file
	let successCount = 0;
	let errorCount = 0;

	for (const inputParam of inputParams) {
		try {
			await processSingleFile(inputParam, outputParams, transformer, modelOptions);
			successCount++;
		} catch (error) {
			errorCount++;
			console.error(
				`Error processing ${inputParam.filePath}: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	// Summary for multi-file processing
	console.log(`\\nProcessed ${successCount} file(s) successfully`);
	if (errorCount > 0) {
		console.log(`Failed to process ${errorCount} file(s)`);
	}
}

/**
 * Processes files using model-specific result.
 * Dispatches to single or multiple file handlers based on input type.
 */
export async function processFiles<
	TSourceType extends FileFormatType,
	TTargetType extends FileFormatType,
>(modelResult: ModelSpecificResult<TSourceType, TTargetType>): Promise<void> {
	if (modelResult.inputProcessingParams.type === "single") {
		await processSingleFile(
			modelResult.inputProcessingParams.file,
			modelResult.outputParams,
			modelResult.transformer,
			modelResult.modelOptions,
		);
	} else {
		await processMultipleFiles(
			modelResult.inputProcessingParams.files,
			modelResult.outputParams,
			modelResult.transformer,
			modelResult.modelOptions,
		);
	}
}
