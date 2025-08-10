import { extname } from "node:path";
import { inferFormatFromExtension } from "./file-sys/file-format.ts";
import { expandInputPattern } from "./file-sys/file-path.ts";
import { processFiles } from "./files-transformation-processor.ts";
import {
	extractModelSpecificOptions,
	resolveOutputParams,
	validateSourceFormat,
} from "./param-resolution.ts";
import type {
	CommonProcessingParams,
	FileFormatType,
	InputParams,
	InputProcessingParams,
	ModelSpecificResult,
	RawCommandOptions,
} from "./types.ts";

/**
 * Function type for model-specific processors.
 * Takes common parameters and returns model-specific processing result.
 */
type ModelProcessorFunction<
	TSourceType extends FileFormatType,
	TTargetType extends FileFormatType,
> = (commonParams: CommonProcessingParams) => ModelSpecificResult<TSourceType, TTargetType>;

/**
 * Common CLI command orchestrator.
 * Handles common logic shared across all model types, then delegates to model-specific processors.
 * Extracted from processClassModelCommand to separate common and model-specific concerns.
 */
export async function processModelCommand<
	TSourceType extends FileFormatType,
	TTargetType extends FileFormatType,
>(
	inputPattern: string,
	rawOptions: RawCommandOptions,
	modelProcessor: ModelProcessorFunction<TSourceType, TTargetType>,
): Promise<void> {
	// Step 1: Validate core output parameters
	const outputParams = resolveOutputParams(rawOptions);

	// Step 2: Extract model-specific options
	const modelSpecificOptions = extractModelSpecificOptions(rawOptions);

	// Step 3: Validate and resolve explicit source type if provided
	let explicitSourceType: FileFormatType | undefined;
	if (rawOptions.source) {
		explicitSourceType = validateSourceFormat(rawOptions.source);
	}

	// Step 4: Expand GLOB and process files
	const patternResult = await expandInputPattern(inputPattern);

	if (patternResult.type === "multiple" && patternResult.files.length === 0) {
		console.log(`No files found matching pattern: ${inputPattern}`);
		return;
	}

	// Step 5: Create input processing params with format detection (common to all models)
	const createInputParam = (filePath: string): InputParams<FileFormatType> => {
		let sourceType: FileFormatType;
		if (explicitSourceType) {
			sourceType = explicitSourceType;
		} else {
			const ext = extname(filePath).toLowerCase();
			const inferredFormat = inferFormatFromExtension(ext);
			if (!inferredFormat) {
				throw new Error(`Unsupported file extension: ${ext}`);
			}
			sourceType = inferredFormat;
		}

		return {
			filePath,
			sourceType,
		};
	};

	const inputProcessingParams: InputProcessingParams<FileFormatType> =
		patternResult.type === "single"
			? { type: "single", file: createInputParam(patternResult.file) }
			: { type: "multiple", files: patternResult.files.map(createInputParam) };

	// Step 6: Create common processing parameters
	const commonParams: CommonProcessingParams = {
		outputParams,
		modelOptions: modelSpecificOptions,
		inputProcessingParams,
	};

	// Step 7: Delegate to model-specific processor
	const modelResult = modelProcessor(commonParams);

	// Step 8: Process files using model-specific result
	await processFiles(modelResult);
}
