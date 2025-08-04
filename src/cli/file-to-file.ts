import { readFileSync, writeFileSync } from "node:fs";
import {
	convertModel,
	type ModelType,
	type OutputTargetType,
	outputTargets,
	parseFileContent,
	validateModel,
} from "../api/internal.ts";
import { changeExtension, detectInputFormat, validateFileExtension } from "./file.ts";

/**
 * Common options interface for transformation commands.
 */
interface TransformationOptions {
	output?: string;
	save?: boolean;
}

/**
 * Generic file-to-file transformation workflow using atomic functions.
 */
export function transformFileToFile(
	inputFile: string,
	options: TransformationOptions,
	modelType: ModelType,
	outputTarget: OutputTargetType,
): void {
	const inputFormat = detectInputFormat(inputFile);
	const outputConfig = outputTargets[outputTarget];

	let outputFile = options.output;
	if (outputFile) {
		validateFileExtension(outputFile, outputConfig.validOutputExtensions);
	} else if (options.save) {
		outputFile = changeExtension(inputFile, outputConfig.defaultOutputExtension);
	}

	const content = readFileSync(inputFile, "utf-8");

	// Use atomic functions directly
	const parsedData = parseFileContent(content, inputFormat);
	const model = validateModel(parsedData, modelType);
	const diagram = convertModel(model, modelType, outputTarget);

	if (outputFile) {
		writeFileSync(outputFile, diagram);
		console.log(
			`${outputConfig.outputFormatName} written to: ${outputFile} (from ${inputFormat.toUpperCase()})`,
		);
	} else {
		console.log(diagram);
	}
}
