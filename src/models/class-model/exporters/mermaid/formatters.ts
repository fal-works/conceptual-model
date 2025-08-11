/**
 * Text formatting utilities for Mermaid class diagram syntax.
 */

import type { ClassModelEdge } from "../../types.ts";

/**
 * Converts Pascal/camelCase to space-separated lowercase.
 * Preserves all-caps acronyms (e.g., "JSONError" -> "JSON error", "InputFileFormat" -> "input file format").
 * @package
 */
export function generateAutoLabel(className: string): string {
	return className
		.replace(/([a-z])(?=[A-Z])|([A-Z]+)(?=[A-Z][a-z])/g, "$& ")
		.replace(/\b([A-Z][a-z]+)/g, (m) => m.toLowerCase());
}

/**
 * Converts a relation type to the corresponding Mermaid arrow syntax.
 * @package
 */
export function getRelationArrow(relation?: ClassModelEdge["relation"]): string {
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
 * @package
 */
export function formatMultiplicity(multiplicity?: string): {
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
 * Sanitizes class names for Mermaid syntax by replacing invalid characters.
 * @package
 */
export function sanitizeClassName(className: string): string {
	return className.replace(/[()]/g, "_");
}

/**
 * Escapes label text for Mermaid display by converting newlines to HTML breaks.
 * @package
 */
export function escapeLabel(label: string): string {
	return label.replace(/\n|\\n/g, "<br>");
}
