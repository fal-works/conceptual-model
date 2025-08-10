import type { ExporterMapConstraint, ImporterMapConstraint } from "../model-spec.ts";
import type { MermaidClassDiagramOptions } from "./exporters/mermaid.ts";
import { exportMermaid } from "./exporters/mermaid.ts";
import { importJson } from "./importers/json.ts";
import { importYaml } from "./importers/yaml.ts";
import { schema } from "./schema-object.ts";
import type { ClassModel, ClassModelEdge, ClassModelGroup, ClassModelNode } from "./types.ts";

export { schema as classModelSchema };
export type { ClassModel, ClassModelEdge, ClassModelGroup, ClassModelNode };

/**
 * Available importer types for class models.
 */
export type ClassModelImporterKeys = "yaml" | "json";

/**
 * Available exporter types for class models.
 */
export type ClassModelExporterKeys = "mermaid";

/**
 * Importers for converting source formats to ClassModel.
 */
export const classModelImporters = {
	yaml: importYaml,
	json: importJson,
} as const satisfies ImporterMapConstraint<ClassModelImporterKeys, ClassModel>;

/**
 * Exporters for converting ClassModel to target formats.
 */
export const classModelExporters = {
	mermaid: exportMermaid,
} as const satisfies ExporterMapConstraint<ClassModelExporterKeys, ClassModel>;

export type { MermaidClassDiagramOptions };
