import { readFileSync, writeFileSync } from "node:fs";
import { outputTargets } from "../core/output-targets.ts";
import { transform } from "../core/pipeline.ts";
import type { ProcessType } from "../core/types.ts";
import { processToOutputTarget } from "../core/types.ts";
import { changeExtension, detectInputFormat, validateFileExtension } from "./file.ts";

/**
 * Common options interface for transformation commands.
 */
export interface TransformationOptions {
	output?: string;
	save?: boolean;
}

/**
 * Generic file-to-file transformation workflow.
 */
export function transformFileToFile(
	inputFile: string,
	options: TransformationOptions,
	processType: ProcessType,
): void {
	const inputFormat = detectInputFormat(inputFile);
	const outputTarget = processToOutputTarget[processType];
	const outputConfig = outputTargets[outputTarget];

	let outputFile = options.output;
	if (outputFile) {
		validateFileExtension(outputFile, outputConfig.validOutputExtensions);
	} else if (options.save) {
		outputFile = changeExtension(inputFile, outputConfig.defaultOutputExtension);
	}

	const content = readFileSync(inputFile, "utf-8");
	const diagram = transform(content, inputFormat, processType);

	if (outputFile) {
		writeFileSync(outputFile, diagram);
		console.log(
			`${outputConfig.outputFormatName} written to: ${outputFile} (from ${inputFormat.toUpperCase()})`,
		);
	} else {
		console.log(diagram);
	}
}
