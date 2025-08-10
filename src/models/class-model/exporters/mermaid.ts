import type { ClassModel, ClassModelGroup, ClassModelNode } from "../types.ts";
import {
	escapeLabel,
	formatMultiplicity,
	generateAutoLabel,
	getRelationArrow,
	sanitizeClassName,
} from "./mermaid-utils.ts";

/**
 * Parameters for Mermaid class diagram generation.
 * All properties are required.
 */
interface MermaidClassDiagramParams {
	/**
	 * Automatically generate class labels if no specific label is specified.
	 * Converts Pascal/camelCase to space-separated lowercase.
	 * Examples: "JSONError" -> "JSON error", "UserAccount" -> "user account"
	 */
	autoClassLabels: boolean;
}

/**
 * Optional configuration type for public API.
 */
export type MermaidClassDiagramOptions = Partial<MermaidClassDiagramParams>;

/**
 * Default parameters for Mermaid class diagram generation.
 */
const DEFAULT_PARAMS: MermaidClassDiagramParams = {
	autoClassLabels: false,
};

/**
 * Merges user options with defaults to create complete parameters.
 */
function resolveParams(userOptions?: MermaidClassDiagramOptions): MermaidClassDiagramParams {
	return {
		...DEFAULT_PARAMS,
		...userOptions,
	};
}

/**
 * Generates Mermaid class diagram lines for a single node.
 * Handles class declaration, optional label, and attributes with proper indentation.
 */
function generateNodeLines(
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
 * Exports a ClassModel to Mermaid class diagram syntax.
 */
export function exportMermaid(model: ClassModel, options?: MermaidClassDiagramOptions): string {
	const params = resolveParams(options);
	const lines: string[] = [];

	// Add title as frontmatter if available
	if (model.title) {
		lines.push("---");
		lines.push(`title: ${model.title}`);
		lines.push("---");
	}

	// Start with classDiagram directive
	lines.push("classDiagram");

	// Add direction if available
	if (model.layout?.direction) {
		lines.push(`    direction ${model.layout.direction}`);
	}

	const processedNodes = new Set<string>();

	// Generate grouped classes
	if (model.groups) {
		for (const [groupKey, groupData] of Object.entries(model.groups)) {
			const group: ClassModelGroup | null = groupData;
			if (!group?.nodes || group.nodes.length === 0) continue;

			const namespaceName = groupKey;
			lines.push(`namespace ${namespaceName} {`);

			for (const nodeName of group.nodes) {
				if (processedNodes.has(nodeName)) {
					throw new Error(`Node '${nodeName}' belongs to multiple groups`);
				}
				processedNodes.add(nodeName);

				const node: ClassModelNode | undefined = model.nodes?.[nodeName];
				const nodeLines = generateNodeLines(nodeName, node, params);
				lines.push(...nodeLines);
			}

			lines.push("}");
		}
	}

	// Generate ungrouped classes
	for (const nodeName of Object.keys(model.nodes ?? {})) {
		if (processedNodes.has(nodeName)) continue;

		const node: ClassModelNode | undefined = model.nodes?.[nodeName];
		const nodeLines = generateNodeLines(nodeName, node, params);
		lines.push(...nodeLines);
	}

	// Generate relationships
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

	return lines.join("\n");
}
