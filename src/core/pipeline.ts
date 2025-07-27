import { conversions, type ModelOfConversion } from "../conversions/index.ts";
import { parsers } from "./parsers.ts";
import type { ConversionType, InputFileFormat } from "./types.ts";
import { formatValidationErrors, validateData } from "./validation.ts";

/**
 * Transforms input string through a pipeline of parsing, validation, and conversion.
 * @param input - The input string to transform
 * @param inputFileFormat - The input file format that determines parser
 * @param conversionType - The conversion type that determines schema and converter
 * @returns The transformed output
 * @throws Error if parsing, validation, or conversion fails
 */
export function transform(
	input: string,
	inputFileFormat: InputFileFormat,
	conversionType: ConversionType,
): string {
	const conversion = conversions[conversionType];
	const parser = parsers[inputFileFormat];

	const parsedData = parser(input);

	const validationResult = validateData<ModelOfConversion<typeof conversionType>>(
		conversion.schema,
		parsedData,
	);

	if (!validationResult.valid) {
		const errorMessage = formatValidationErrors(validationResult.errors);
		throw new Error(`Validation failed: ${errorMessage}`);
	}

	return conversion.convert(validationResult.data);
}
