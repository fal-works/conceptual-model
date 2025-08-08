import type {
	ClassModel,
	ClassModelEdge,
	ClassModelGroup,
	ClassModelNode,
} from "../models/class-model/index.ts";

/**
 * Converts a relation type to the corresponding Mermaid arrow syntax.
 */
function getRelationArrow(relation?: ClassModelEdge["relation"]): string {
	switch (relation) {
		case "is-a":
			return "--|>";
		case "is-composed-of":
			return "*--";
		case "aggregates":
			return "o--";
		case "refers-to":
			return "-->";
		case "to":
			return "-->";
		case "with":
			return "--";
		default:
			return "--";
	}
}

/**
 * Parses multiplicity string and formats it for Mermaid diagram source and target sides.
 * Supports both single multiplicity (applies to target) and directional format (source->target).
 */
function formatMultiplicity(multiplicity?: string): {
	source: string;
	target: string;
} {
	if (!multiplicity) {
		return { source: "", target: "" };
	}

	// Check if it contains "->"
	const arrowMatch = multiplicity.match(/^(.+?)\s*->\s*(.+)$/);
	if (arrowMatch) {
		return {
			source: arrowMatch[1].trim(),
			target: arrowMatch[2].trim(),
		};
	}

	// Single multiplicity applies to target side
	return {
		source: "",
		target: multiplicity.trim(),
	};
}

/**
 * Generates Mermaid class diagram lines for a single node.
 * Handles class declaration, optional label, and attributes with proper indentation.
 */
function generateNodeLines(nodeName: string, node: ClassModelNode | null): string[] {
	const className = nodeName.replace(/[()]/g, "_");
	const classDeclaration =
		node?.label && node.label !== nodeName
			? `    class ${className}["${node.label.replace(/\n|\\n/g, "<br>")}"]`
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
 * Converts a ClassModel to Mermaid class diagram syntax.
 * Supports groups as namespaces, node attributes, relationships, and layout options.
 * Throws an error if a node belongs to multiple groups.
 */
export function convertToMermaidClassDiagram(model: ClassModel): string {
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
			const group = groupData as ClassModelGroup | null;
			if (!group?.nodes || group.nodes.length === 0) continue;

			const namespaceName = group.label || groupKey;
			lines.push(`namespace ${namespaceName} {`);

			for (const nodeName of group.nodes) {
				if (processedNodes.has(nodeName)) {
					throw new Error(`Node '${nodeName}' belongs to multiple groups`);
				}
				processedNodes.add(nodeName);

				const node = model.nodes?.[nodeName] as ClassModelNode | null;
				const nodeLines = generateNodeLines(nodeName, node);
				lines.push(...nodeLines);
			}

			lines.push("}");
		}
	}

	// Generate ungrouped classes
	for (const nodeName of Object.keys(model.nodes ?? {})) {
		if (processedNodes.has(nodeName)) continue;

		const node = model.nodes?.[nodeName] as ClassModelNode | null;
		const nodeLines = generateNodeLines(nodeName, node);
		lines.push(...nodeLines);
	}

	// Generate relationships
	for (const edge of model.edges ?? []) {
		const sourceClassName = edge.source.replace(/[()]/g, "_");
		const targetClassName = edge.target.replace(/[()]/g, "_");
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
