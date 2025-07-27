import type { JSONSchemaType } from "ajv";
import type { Parser } from "./parsers.ts";
import { formatValidationErrors, validateData } from "./validation.ts";

/**
 * Transforms input string through a pipeline of parsing, validation, and conversion.
 * @param input - The input string to transform
 * @param parser - Function to parse the input string
 * @param schema - JSON schema for validation
 * @param converter - Function to convert validated data to output format
 * @returns The transformed output
 * @throws Error if parsing, validation, or conversion fails
 */
export function transform<TModel, TOutput>(
	input: string,
	parser: Parser,
	schema: JSONSchemaType<TModel> | object,
	converter: (model: TModel) => TOutput,
): TOutput {
	const parsedData = parser(input);

	const validationResult = validateData<TModel>(schema, parsedData);

	if (!validationResult.valid) {
		const errorMessage = formatValidationErrors(validationResult.errors);
		throw new Error(`Validation failed: ${errorMessage}`);
	}

	return converter(validationResult.data);
}
