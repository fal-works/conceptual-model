import { readFileSync, writeFileSync } from "node:fs";
import { internal } from "../index.js";
import { changeExtension, detectInputFormat, validateFileExtension } from "./file.ts";

/**
 * Common options interface for transformation commands.
 */
interface TransformationOptions {
	output?: string;
	save?: boolean;
}

/**
 * Generic file-to-file transformation workflow.
 */
export function transformFileToFile(
	inputFile: string,
	options: TransformationOptions,
	processType: internal.ProcessType,
): void {
	const inputFormat = detectInputFormat(inputFile);
	const outputTarget = internal.processToOutputTarget[processType];
	const outputConfig = internal.outputTargets[outputTarget];

	let outputFile = options.output;
	if (outputFile) {
		validateFileExtension(outputFile, outputConfig.validOutputExtensions);
	} else if (options.save) {
		outputFile = changeExtension(inputFile, outputConfig.defaultOutputExtension);
	}

	const content = readFileSync(inputFile, "utf-8");
	const diagram = internal.transform(content, inputFormat, processType);

	if (outputFile) {
		writeFileSync(outputFile, diagram);
		console.log(
			`${outputConfig.outputFormatName} written to: ${outputFile} (from ${inputFormat.toUpperCase()})`,
		);
	} else {
		console.log(diagram);
	}
}
