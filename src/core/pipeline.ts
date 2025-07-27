import { type ModelOfProcess, processes } from "../processes/index.ts";
import { parsers } from "./parsers.ts";
import type { InputFileFormat, ProcessType } from "./types.ts";
import { formatValidationErrors, validateData } from "./validation.ts";

/**
 * Transforms input string through a pipeline of parsing, validation, and conversion.
 * @param input - The input string to transform
 * @param inputFileFormat - The input file format that determines parser
 * @param processType - The process type that determines schema and converter
 * @returns The transformed output
 * @throws Error if parsing, validation, or conversion fails
 */
export function transform(
	input: string,
	inputFileFormat: InputFileFormat,
	processType: ProcessType,
): string {
	const process = processes[processType];
	const parser = parsers[inputFileFormat];

	const parsedData = parser(input);

	const validationResult = validateData<ModelOfProcess<typeof processType>>(
		process.schema,
		parsedData,
	);

	if (!validationResult.valid) {
		const errorMessage = formatValidationErrors(validationResult.errors);
		throw new Error(`Validation failed: ${errorMessage}`);
	}

	return process.convert(validationResult.data);
}
