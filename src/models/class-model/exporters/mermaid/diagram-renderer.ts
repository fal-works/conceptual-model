import type { ClassModel } from "../../types.ts";
import {
	renderDiagramHeader,
	renderFrontmatter,
	renderGroupedClasses,
	renderRelationships,
	renderUngroupedClasses,
} from "./diagram-parts-renderer.ts";
import type { MermaidClassDiagramParams } from "./params.ts";

/**
 * Renders a ClassModel to Mermaid class diagram syntax.
 */
export function renderDiagram(model: ClassModel, params: MermaidClassDiagramParams): string {
	const processedNodes = new Set<string>();

	const frontmatter = renderFrontmatter(model);
	const header = renderDiagramHeader(model);
	const groupedClasses = renderGroupedClasses(model, params, processedNodes);
	const ungroupedClasses = renderUngroupedClasses(model, params, processedNodes);
	const relationships = renderRelationships(model);

	return [...frontmatter, ...header, ...groupedClasses, ...ungroupedClasses, ...relationships].join(
		"\n",
	);
}
