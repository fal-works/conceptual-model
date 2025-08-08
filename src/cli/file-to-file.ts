import { readFileSync, writeFileSync } from "node:fs";
import {
	convertModel,
	type ModelType,
	type OutputTargetType,
	outputTargets,
	parseFileContent,
	validateModel,
} from "../api/internal.ts";
import type { ConverterOptionsType } from "../converters/index.ts";
import { changeExtension, detectInputFormat, validateFileExtension } from "./file.ts";

/**
 * Common options interface for transformation commands.
 */
interface TransformationOptions {
	output?: string;
	save?: boolean;
	autoClassLabels?: boolean;
}

/**
 * Builds converter-specific options from transformation options for class-model to mermaid.
 */
function buildClassModelMermaidOptions(
	transformationOptions: TransformationOptions,
): ConverterOptionsType<"class-model", "mermaid"> | undefined {
	// Only build options object if user provided values
	if (transformationOptions.autoClassLabels !== undefined) {
		return {
			autoClassLabels: transformationOptions.autoClassLabels,
		};
	}
	return undefined;
}

/**
 * Builds converter-specific options from transformation options.
 * Returns undefined for combinations that don't support options.
 */
function buildConverterOptions<T extends ModelType, O extends OutputTargetType>(
	modelType: T,
	outputTarget: O,
	transformationOptions: TransformationOptions,
): ConverterOptionsType<T, O> | undefined {
	if (modelType === "class-model" && outputTarget === "mermaid") {
		return buildClassModelMermaidOptions(transformationOptions) as ConverterOptionsType<T, O>;
	}
	return undefined;
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

	// Build converter-specific options and convert model
	const converterOptions = buildConverterOptions(modelType, outputTarget, options);
	const diagram = convertModel(model, modelType, outputTarget, converterOptions);

	if (outputFile) {
		writeFileSync(outputFile, diagram);
		console.log(
			`${outputConfig.outputFormatName} written to: ${outputFile} (from ${inputFormat.toUpperCase()})`,
		);
	} else {
		console.log(diagram);
	}
}
