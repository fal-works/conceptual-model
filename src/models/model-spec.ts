import type { AnyBoundary } from "../core/util-types.ts";

/**
 * Type constraint for a collection of importer functions
 * that take any arguments and return a model of type `TModel`.
 *
 * Use this with `satisfies` to ensure type safety.
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
 */
export type ExporterMapConstraint<TExporterType extends string, TModel> = Record<
	TExporterType,
	(model: TModel, ...args: AnyBoundary[]) => AnyBoundary
>;

// ---- EXAMPLES --------------------------------

type Model = { id: number; name: string };

type ImportKeys = "json" | "csv";
type ExportKeys = "html" | "json";

// define importers and exporters with `as const` and `satisfies`
const importers = {
	json: (raw: string) => JSON.parse(raw) as Model,
	csv: (raw: string, delimiter: string = ",") => {
		const [id, name] = raw.split(delimiter);
		return { id: Number(id), name };
	},
} as const satisfies ImporterMapConstraint<ImportKeys, Model>;
const exporters = {
	html: (model: Model, pretty?: boolean) =>
		pretty ? `<pre>${model.name}</pre>` : `<span>${model.name}</span>`,
	json: (model: Model, space?: number) => JSON.stringify(model, null, space),
} as const satisfies ExporterMapConstraint<ExportKeys, Model>;

const m = importers.json("{ id: 1, name: 'Alice' }");
const j = exporters.json(m, 2);

void m;
void j;
