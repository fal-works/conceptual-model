import type { ModelToOutputMapping, ModelType } from "../core/types.ts";
import type { ClassModel } from "../models/class-model/index.ts";

/**
 * Function type for converting a model to a string representation.
 */
export type ConverterFunction<TModel> = (model: TModel) => string;

/**
 * Type mapping from model types to their corresponding TypeScript types.
 */
export type ModelFromType<T extends ModelType> = T extends "class-model" ? ClassModel : never;

/**
 * Type-safe converter registry structure.
 * Each model type maps to its supported output formats and converter functions.
 */
export type ConverterRegistry = {
	[M in ModelType]: {
		[O in ModelToOutputMapping[M]]: ConverterFunction<ModelFromType<M>>;
	};
};
