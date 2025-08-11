/**
 * Class model CLI command processor and validation.
 */
import { isValidValue } from "../../api/internal.ts";
import type { FileFormatType } from "../file-sys/file-format.ts";
import type {
	CommonProcessingParams,
	FileTransformer,
	InputParams,
	InputProcessingParams,
	ModelSpecificResult,
	OutputParams,
	UnresolvedModelSpecificOptions,
} from "../types.ts";
import { transformClassModelContent } from "./class-model-transformer.ts";

/**
 * Valid source formats for class-model.
 */
// TODO: reconsider; what if there are multiple types with the same file format?
type ClassModelSourceType = Extract<FileFormatType, "json" | "yaml">;
const VALID_SOURCE_TYPES = new Set<ClassModelSourceType>(["json", "yaml"]);

/**
 * Valid target formats for class-model.
 */
// TODO: reconsider; what if there are multiple types with the same file format?
type ClassModelTargetType = Extract<FileFormatType, "mermaid">;
const VALID_TARGET_TYPES = new Set<ClassModelTargetType>(["mermaid"]);

/**
 * Validates and narrows source type to class-model supported types.
 */
function validateClassModelSourceType(sourceType: FileFormatType): ClassModelSourceType {
	if (!isValidValue(VALID_SOURCE_TYPES, sourceType)) {
		throw new Error(
			`Unsupported source type '${sourceType}' for class-model. Valid types: ${Array.from(VALID_SOURCE_TYPES).join(", ")}`,
		);
	}
	return sourceType;
}

/**
 * Validates and narrows target type to class-model supported types.
 */
function validateClassModelTargetType(targetType: FileFormatType): ClassModelTargetType {
	if (!isValidValue(VALID_TARGET_TYPES, targetType)) {
		throw new Error(
			`Invalid target type '${targetType}' for class-model. Valid types: ${Array.from(VALID_TARGET_TYPES).join(", ")}`,
		);
	}
	return targetType;
}

/**
 * Processes class-model specific logic after common orchestration.
 * Takes resolved common parameters and returns model-specific processing result.
 */
export function processClassModelCommand(
	commonParams: CommonProcessingParams,
): ModelSpecificResult<ClassModelSourceType, ClassModelTargetType> {
	// Step 1: Validate model-specific target constraint
	const narrowTargetType = validateClassModelTargetType(commonParams.outputParams.targetType);

	// Step 2: Validate and narrow input processing params to class-model supported types
	const validateInputParam = (
		inputParam: InputParams<FileFormatType>,
	): InputParams<ClassModelSourceType> => {
		// Validate that detected source type is supported by class-model
		const narrowSourceType = validateClassModelSourceType(inputParam.sourceType);

		return {
			filePath: inputParam.filePath,
			sourceType: narrowSourceType,
		};
	};

	const inputProcessingParams: InputProcessingParams<ClassModelSourceType> =
		commonParams.inputProcessingParams.type === "single"
			? { type: "single", file: validateInputParam(commonParams.inputProcessingParams.file) }
			: {
					type: "multiple",
					files: commonParams.inputProcessingParams.files.map(validateInputParam),
				};

	// Step 3: Create transformer and narrow output params
	const transformer = createClassModelTransformer(narrowTargetType);
	const narrowOutputParams: OutputParams<ClassModelTargetType> = {
		targetType: narrowTargetType,
		outputStrategy: commonParams.outputParams.outputStrategy,
	};

	// Step 5: Return structured result for orchestrator
	return {
		inputProcessingParams,
		outputParams: narrowOutputParams,
		transformer,
		modelOptions: commonParams.modelOptions,
	};
}

/**
 * Creates a transformer function for class-model transformations.
 * Pure function that transforms content using validated options.
 */
function createClassModelTransformer(
	narrowTargetType: ClassModelTargetType,
): FileTransformer<ClassModelSourceType, ClassModelTargetType> {
	return (
		content: string,
		inputParams: InputParams<ClassModelSourceType>,
		_outputParams: OutputParams<ClassModelTargetType>,
		modelOptions: UnresolvedModelSpecificOptions,
	): string => {
		return transformClassModelContent(
			content,
			inputParams.sourceType,
			narrowTargetType,
			modelOptions,
		);
	};
}
