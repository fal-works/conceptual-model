import { convertToMermaidClassDiagram } from "../converters/mermaid-class-diagram.ts";
import { parseJson, parseYaml } from "../core/parsers.ts";
import { transform } from "../core/pipeline.ts";
import * as classModel from "../models/class-model/index.ts";

/**
 * Converts YAML string containing class model data to a Mermaid class diagram string.
 * @param yamlString - The YAML content as a string
 * @returns The generated Mermaid class diagram as a string
 * @throws Error if YAML parsing fails or data is invalid
 */
export function yamlToMermaid(yamlString: string): string {
	return transform(yamlString, parseYaml, classModel.schema, (data: classModel.Schema) =>
		convertToMermaidClassDiagram(data.graph),
	);
}

/**
 * Converts JSON string containing class model data to a Mermaid class diagram string.
 * @param jsonString - The JSON content as a string
 * @returns The generated Mermaid class diagram as a string
 * @throws Error if JSON parsing fails or data is invalid
 */
export function jsonToMermaid(jsonString: string): string {
	return transform(jsonString, parseJson, classModel.schema, (data: classModel.Schema) =>
		convertToMermaidClassDiagram(data.graph),
	);
}
