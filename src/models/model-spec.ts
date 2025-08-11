import type { AnyBoundary } from "../core/util-types.ts";

/**
 * Type constraint for a collection of importer functions
 * that take any arguments and return a model of type `TModel`.
 *
 * Use this with `satisfies` to ensure type safety.
 *
 * @example
 * type MyObject = { id: number; name: string };
 * const importers = {
 * 	csv: (raw: string, delimiter: string = ",") => {
 * 		const [id, name] = raw.split(delimiter);
 * 		return { id: Number(id), name };
 * 	},
 * } as const satisfies ImporterMapConstraint<ImportKeys, MyObject>;
 */
export type ImporterMapConstraint<TImporterType extends string, TModel> = Record<
	TImporterType,
	(...args: AnyBoundary[]) => TModel
>;

/**
 * Type constraint for a collection of exporter functions
 * that take a model of type `TModel` and any additional arguments,
 * returning any particular type.
 *
 * Use this with `satisfies` to ensure type safety.
 *
 * @example
 * type MyObject = { id: number; name: string };
 * const exporters = {
 * 	json: (obj: MyObject, space?: number) => JSON.stringify(obj, null, space),
 * } as const satisfies ExporterMapConstraint<ExportKeys, MyObject>;
 */
export type ExporterMapConstraint<TExporterType extends string, TModel> = Record<
	TExporterType,
	(model: TModel, ...args: AnyBoundary[]) => AnyBoundary
>;
