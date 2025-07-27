import { readFileSync, writeFileSync } from "node:fs";
import { outputTargets } from "../core/output-targets.ts";
import { transform } from "../core/pipeline.ts";
import type { ConversionType } from "../core/types.ts";
import { conversionToOutputTarget } from "../core/types.ts";
import { changeExtension, detectInputFormat, validateFileExtension } from "./file.ts";

/**
 * Common options interface for conversion commands.
 */
export interface ConversionOptions {
	output?: string;
	save?: boolean;
}

/**
 * Generic file-to-file conversion workflow.
 */
export function convertFileToFile(
	inputFile: string,
	options: ConversionOptions,
	conversionType: ConversionType,
): void {
	const inputFormat = detectInputFormat(inputFile);
	const outputTarget = conversionToOutputTarget[conversionType];
	const outputConfig = outputTargets[outputTarget];

	let outputFile = options.output;
	if (outputFile) {
		validateFileExtension(outputFile, outputConfig.validOutputExtensions);
	} else if (options.save) {
		outputFile = changeExtension(inputFile, outputConfig.defaultOutputExtension);
	}

	const content = readFileSync(inputFile, "utf-8");
	const diagram = transform(content, inputFormat, conversionType);

	if (outputFile) {
		writeFileSync(outputFile, diagram);
		console.log(
			`${outputConfig.outputFormatName} written to: ${outputFile} (from ${inputFormat.toUpperCase()})`,
		);
	} else {
		console.log(diagram);
	}
}
