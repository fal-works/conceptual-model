import type { ProcessType } from "../core/types.ts";
import * as classModel from "../models/class-model/index.ts";
import { convertToMermaidClassDiagram } from "./mermaid-class-diagram.ts";

/**
 * Specification for a single process.
 *
 * Determines the validation schema and a function that converts
 * validated data to the desired output format.
 */
interface ProcessSpec<TData> {
	schema: object;
	convert: (data: TData) => string;
}

/**
 * Registry of all supported processes with their schemas and converter functions.
 * Each process type maps to a complete process specification.
 */
export const processes = {
	"class-model-to-mermaid": {
		schema: classModel.schema,
		convert: (data: classModel.Model) => convertToMermaidClassDiagram(data.graph),
	},
	// biome-ignore lint/suspicious/noExplicitAny: Type constraint needs flexibility for different model types
} as const satisfies Record<ProcessType, ProcessSpec<any>>;

/**
 * Extract the model data type from the process of a given process type.
 */
export type ModelOfProcess<T extends ProcessType> = T extends keyof typeof processes
	? Parameters<(typeof processes)[T]["convert"]>[0]
	: never;
