import type { ClassModel, ClassModelEdge, ClassModelNode } from "../models/class-model/index.ts";

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
			source: ` "${arrowMatch[1].trim()}"`,
			target: ` "${arrowMatch[2].trim()}"`,
		};
	}

	// Single multiplicity applies to target side
	return {
		source: "",
		target: ` "${multiplicity.trim()}"`,
	};
}

export function convertToMermaidClassDiagram(model: ClassModel): string {
	const lines: string[] = [];

	// Start with classDiagram directive
	lines.push("classDiagram");

	// Add direction if available
	if (model.layout?.direction) {
		lines.push(`    direction ${model.layout.direction}`);
	}

	// Add title if available
	if (model.title) {
		lines.push(`    title ${model.title}`);
	}

	// Generate classes
	for (const [nodeName, nodeData] of Object.entries(model.nodes ?? {})) {
		const node = nodeData as ClassModelNode | null;
		const className = nodeName.replace(/[()]/g, "_");
		const classDeclaration = node?.label
			? `class ${className}["${node.label.replace(/\n|\\n/g, "<br>")}"]`
			: `class ${className}`;

		if (node?.attributes && node.attributes.length > 0) {
			lines.push(`    ${classDeclaration} {`);
			for (const field of node.attributes) {
				lines.push(`        ${field}`);
			}
			lines.push("    }");
		} else {
			lines.push(`    ${classDeclaration}`);
		}
	}

	// Generate relationships
	for (const edge of model.edges ?? []) {
		const sourceClassName = edge.source.replace(/[()]/g, "_");
		const targetClassName = edge.target.replace(/[()]/g, "_");
		const arrow = getRelationArrow(edge.relation);
		const multiplicity = formatMultiplicity(edge.multiplicity);
		const labelText = edge.label ? ` : ${edge.label}` : "";

		lines.push(
			`    ${sourceClassName}${multiplicity.source} ${arrow}${multiplicity.target} ${targetClassName}${labelText}`,
		);
	}

	return lines.join("\n");
}
