import type {
	ClassModelEdge,
	ClassModelGraph,
	ClassModelNode,
} from "../models/class-model/index.ts";

function getRelationArrow(relation?: ClassModelEdge["relation"]): string {
	switch (relation) {
		case "is-composed-of":
			return "*--";
		case "aggregates":
			return "o--";
		case "links-to":
			return "-->";
		case "is-a":
			return "--|>";
		case undefined:
			return "--";
		default:
			return "-->";
	}
}

function formatMultiplicity(multiplicity?: { source?: string; target?: string }): {
	source: string;
	target: string;
} {
	return {
		source: multiplicity?.source ? ` "${multiplicity.source}"` : "",
		target: multiplicity?.target ? ` "${multiplicity.target}"` : "",
	};
}

export function convertToMermaidClassDiagram(graph: ClassModelGraph): string {
	const lines: string[] = [];

	// Start with classDiagram directive
	lines.push("classDiagram");

	// Add direction if available
	if (graph.metadata?.layout?.direction) {
		lines.push(`    direction ${graph.metadata.layout.direction}`);
	}

	// Add title if available
	if (graph.label) {
		lines.push(`    title ${graph.label}`);
	}

	// Generate classes
	for (const [nodeName, nodeData] of Object.entries(graph.nodes ?? {})) {
		const node = nodeData as ClassModelNode;
		const className = nodeName.replace(/[()]/g, "_");
		const classDeclaration = node.label
			? `class ${className}["${node.label.replace(/\n|\\n/g, "<br>")}"]`
			: `class ${className}`;

		if (node.metadata?.attributes && node.metadata.attributes.length > 0) {
			lines.push(`    ${classDeclaration} {`);
			for (const field of node.metadata.attributes) {
				lines.push(`        ${field}`);
			}
			lines.push("    }");
		} else {
			lines.push(`    ${classDeclaration}`);
		}
	}

	// Generate relationships
	for (const edge of graph.edges ?? []) {
		const sourceClassName = edge.source.replace(/[()]/g, "_");
		const targetClassName = edge.target.replace(/[()]/g, "_");
		const arrow = getRelationArrow(edge.relation);
		const multiplicity = formatMultiplicity(edge.metadata?.multiplicity);
		const labelText = edge.label ? ` : ${edge.label}` : "";

		lines.push(
			`    ${sourceClassName}${multiplicity.source} ${arrow}${multiplicity.target} ${targetClassName}${labelText}`,
		);
	}

	return lines.join("\n");
}
