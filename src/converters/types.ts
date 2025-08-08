import type { ModelToOutputMapping, ModelType } from "../core/types.ts";
import type { ClassModel } from "../models/class-model/index.ts";
import type { MermaidClassDiagramOptions } from "./mermaid-class-diagram.ts";

/**
 * Function type for converting a model to a string representation.
 */
export type ConverterFunction<TModel, TOptions = never> = [TOptions] extends [never]
	? (model: TModel) => string
	: (model: TModel, options?: TOptions) => string;

/**
 * Type mapping from model types to their corresponding TypeScript types.
 */
export type ModelFromType<T extends ModelType> = T extends "class-model" ? ClassModel : never;

/**
 * Type mapping from model-output combinations to their options types.
 * This enables automatic type inference for converter options.
 */
export type ConverterOptionsType<
	M extends ModelType,
	O extends ModelToOutputMapping[M],
> = M extends "class-model" ? (O extends "mermaid" ? MermaidClassDiagramOptions : never) : never;

/**
 * Type-safe converter registry structure.
 * Each model type maps to its supported output formats and converter functions.
 */
export type ConverterRegistry = {
	[M in ModelType]: {
		[O in ModelToOutputMapping[M]]: ConverterFunction<ModelFromType<M>, ConverterOptionsType<M, O>>;
	};
};
