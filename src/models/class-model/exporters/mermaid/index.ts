import type { ClassModel } from "../../types.ts";
import { renderDiagram } from "./diagram-renderer.ts";
import { type MermaidClassDiagramOptions, resolveParams } from "./params.ts";

export type { MermaidClassDiagramOptions } from "./params.ts";

export function exportMermaid(model: ClassModel, options?: MermaidClassDiagramOptions): string {
	return renderDiagram(model, resolveParams(options));
}
