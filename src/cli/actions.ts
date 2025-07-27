import { readFileSync, writeFileSync } from "node:fs";
import type { InputFileFormat, ModelType, OutputTargetType } from "../core/types.ts";
import { classModel } from "../index.ts";
import { changeExtension, detectInputFormat, validateFileExtension } from "./file.ts";

const { jsonToMermaid, yamlToMermaid } = classModel;

/**
 * Common options interface for conversion commands.
 */
export interface ConversionOptions {
	output?: string;
	save?: boolean;
}

/**
 * Output target configuration.
 */
interface OutputConfig {
	validOutputExtensions: string[];
	defaultOutputExtension: string;
	outputFormatName: string;
}

/**
 * Gets converter function based on input format, model type, and output target.
 */
function getConverter(
	inputFormat: InputFileFormat,
	modelType: ModelType,
	outputTarget: OutputTargetType,
): (content: string) => string {
	// Currently only supports class-model -> mermaid
	if (modelType === "class-model" && outputTarget === "mermaid") {
		switch (inputFormat) {
			case "yaml":
				return yamlToMermaid;
			case "json":
				return jsonToMermaid;
			default:
				throw new Error(`Unsupported input format: ${inputFormat}`);
		}
	}
	throw new Error(`Unsupported combination: ${modelType} -> ${outputTarget}`);
}

/**
 * Gets output configuration for the specified target.
 */
function getOutputConfig(outputTarget: OutputTargetType): OutputConfig {
	switch (outputTarget) {
		case "mermaid":
			return {
				validOutputExtensions: [".mmd", ".mermaid"],
				defaultOutputExtension: ".mermaid",
				outputFormatName: "Mermaid diagram",
			};
		default:
			throw new Error(`Unsupported output target: ${outputTarget}`);
	}
}

/**
 * Generic model conversion workflow.
 */
export function convertModel(
	inputFile: string,
	options: ConversionOptions,
	modelType: ModelType,
	outputTarget: OutputTargetType,
): void {
	const inputFormat = detectInputFormat(inputFile);
	const converter = getConverter(inputFormat, modelType, outputTarget);
	const outputConfig = getOutputConfig(outputTarget);

	let outputFile = options.output;
	if (outputFile) {
		validateFileExtension(outputFile, outputConfig.validOutputExtensions);
	} else if (options.save) {
		outputFile = changeExtension(inputFile, outputConfig.defaultOutputExtension);
	}

	const content = readFileSync(inputFile, "utf-8");
	const diagram = converter(content);

	if (outputFile) {
		writeFileSync(outputFile, diagram);
		console.log(
			`${outputConfig.outputFormatName} written to: ${outputFile} (from ${inputFormat.toUpperCase()})`,
		);
	} else {
		console.log(diagram);
	}
}

/**
 * Converts class model files to Mermaid diagrams.
 */
export function convertClassModelToMermaid(inputFile: string, options: ConversionOptions): void {
	convertModel(inputFile, options, "class-model", "mermaid");
}
