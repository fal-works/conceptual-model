import { getConverter, type ModelFromType } from "../converters/index.ts";
import { classModelSchema } from "../models/class-model/index.ts";
import { parsers } from "./parsers.ts";
import type { InputFileFormat, ModelToOutputMapping, ModelType } from "./types.ts";
import { createValidator, formatValidationErrors, validateData } from "./validation.ts";

/**
 * Registry of model schemas for validation.
 */
const modelSchemas: Record<ModelType, object> = {
	"class-model": classModelSchema,
};

/**
 * Parses file content into an unknown data structure.
 *
 * @param content - The file content to parse
 * @param format - The input file format (json or yaml)
 * @returns The parsed data as unknown
 * @throws Error if parsing fails
 */
export function parseFileContent(content: string, format: InputFileFormat): unknown {
	const parser = parsers[format];
	return parser(content);
}

/**
 * Validates parsed data against a model schema.
 *
 * @param data - The data to validate
 * @param modelType - The model type to validate against
 * @returns The validated model data
 * @throws Error if validation fails
 */
export function validateModel<T extends ModelType>(data: unknown, modelType: T): ModelFromType<T> {
	const schema = modelSchemas[modelType];
	if (!schema) {
		throw new Error(`No schema found for model type: ${modelType}`);
	}

	const validationResult = validateData<ModelFromType<T>>(schema, data);

	if (!validationResult.valid) {
		const errorMessage = formatValidationErrors(validationResult.errors);
		throw new Error(`Validation failed: ${errorMessage}`);
	}

	return validationResult.data;
}

/**
 * Converts a model to a string representation.
 *
 * @param model - The model to convert
 * @param modelType - The type of the model
 * @param outputTarget - The desired output format
 * @returns The converted string representation
 */
export function convertModel<T extends ModelType, O extends ModelToOutputMapping[T]>(
	model: ModelFromType<T>,
	modelType: T,
	outputTarget: O,
): string {
	const converter = getConverter(modelType, outputTarget);
	return converter(model);
}

/**
 * Creates a reusable validator for a specific model type.
 *
 * @param modelType - The model type to create a validator for
 * @returns A validation function for the model type
 */
export function createModelValidator<T extends ModelType>(modelType: T) {
	const schema = modelSchemas[modelType];
	if (!schema) {
		throw new Error(`No schema found for model type: ${modelType}`);
	}

	return createValidator<ModelFromType<T>>(schema);
}
