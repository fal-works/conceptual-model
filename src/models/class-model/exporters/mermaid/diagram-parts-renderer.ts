/**
 * Individual rendering functions for different parts of Mermaid class diagrams.
 */

import type { ClassModel, ClassModelGroup, ClassModelNode } from "../../types.ts";
import {
	escapeLabel,
	formatMultiplicity,
	generateAutoLabel,
	getRelationArrow,
	sanitizeClassName,
} from "./formatters.ts";
import type { MermaidClassDiagramParams } from "./params.ts";

/**
 * Renders frontmatter section with title if available.
 * @package
 */
export function renderFrontmatter(model: ClassModel): string[] {
	if (!model.title) return [];

	return ["---", `title: ${model.title}`, "---"];
}

/**
 * Renders diagram header with classDiagram directive and direction.
 * @package
 */
export function renderDiagramHeader(model: ClassModel): string[] {
	const lines = ["classDiagram"];

	if (model.layout?.direction) {
		lines.push(`    direction ${model.layout.direction}`);
	}

	return lines;
}

/**
 * Generates Mermaid class diagram lines for a single node.
 * Handles class declaration, optional label, and attributes with proper indentation.
 * @package
 */
export function renderClass(
	nodeName: string,
	node: ClassModelNode | null | undefined,
	params: MermaidClassDiagramParams,
): string[] {
	const className = sanitizeClassName(nodeName);

	let effectiveLabel = node?.label;

	// Use auto-generated label if enabled and no explicit label is provided
	if (params.autoClassLabels && !node?.label) {
		effectiveLabel = generateAutoLabel(nodeName);
	}

	const classDeclaration =
		effectiveLabel && effectiveLabel !== nodeName
			? `    class ${className}["${escapeLabel(effectiveLabel)}"]`
			: `    class ${className}`;

	if (node?.attributes && node.attributes.length > 0) {
		const lines = [`${classDeclaration} {`];
		for (const field of node.attributes) {
			lines.push(`        ${field}`);
		}
		lines.push("    }");
		return lines;
	} else {
		return [classDeclaration];
	}
}

/**
 * Renders grouped classes within namespaces.
 * @package
 */
export function renderGroupedClasses(
	model: ClassModel,
	params: MermaidClassDiagramParams,
	processedNodes: Set<string>,
): string[] {
	const lines: string[] = [];

	if (!model.groups) return lines;

	for (const [groupKey, groupData] of Object.entries(model.groups)) {
		const group: ClassModelGroup | null = groupData;
		if (!group?.nodes || group.nodes.length === 0) continue;

		lines.push(`namespace ${groupKey} {`);

		for (const nodeName of group.nodes) {
			if (processedNodes.has(nodeName)) {
				throw new Error(`Node '${nodeName}' belongs to multiple groups`);
			}
			processedNodes.add(nodeName);

			const node: ClassModelNode | undefined = model.nodes?.[nodeName];
			const nodeLines = renderClass(nodeName, node, params);
			lines.push(...nodeLines);
		}

		lines.push("}");
	}

	return lines;
}

/**
 * Renders ungrouped classes at the root level.
 * @package
 */
export function renderUngroupedClasses(
	model: ClassModel,
	params: MermaidClassDiagramParams,
	processedNodes: Set<string>,
): string[] {
	const lines: string[] = [];

	for (const nodeName of Object.keys(model.nodes ?? {})) {
		if (processedNodes.has(nodeName)) continue;

		const node: ClassModelNode | undefined = model.nodes?.[nodeName];
		const nodeLines = renderClass(nodeName, node, params);
		lines.push(...nodeLines);
	}

	return lines;
}

/**
 * Renders relationships between classes.
 * @package
 */
export function renderRelationships(model: ClassModel): string[] {
	const lines: string[] = [];

	for (const edge of model.edges ?? []) {
		const sourceClassName = sanitizeClassName(edge.source);
		const targetClassName = sanitizeClassName(edge.target);
		const arrow = getRelationArrow(edge.relation);
		const multiplicity = formatMultiplicity(edge.multiplicity);

		const parts = [sourceClassName];
		if (multiplicity.source) parts.push(`"${multiplicity.source}"`);
		parts.push(arrow);
		if (multiplicity.target) parts.push(`"${multiplicity.target}"`);
		parts.push(targetClassName);
		if (edge.label) parts.push(":", edge.label);

		lines.push(`    ${parts.join(" ")}`);
	}

	return lines;
}
