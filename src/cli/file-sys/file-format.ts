/**
 * Unified file format handling for all supported formats.
 * This module handles both input formats (JSON, YAML) and output formats (Mermaid).
 */

import { isValidValue } from "../../api/internal.ts";

/**
 * All supported file formats for input and output.
 */
export type FileFormatType = "json" | "yaml" | "mermaid";

/**
 * Specification for a single file format.
 */
interface FileFormatSpec {
	validExtensions: ReadonlySet<string>;
	defaultExtension: string;
	formatName: string;
}

/**
 * Registry of all supported file formats with their configurations.
 * This provides type-safe access to format specifications.
 */
const fileFormatMap = {
	json: {
		validExtensions: new Set([".json"]),
		defaultExtension: ".json",
		formatName: "JSON",
	},
	yaml: {
		validExtensions: new Set([".yaml", ".yml"]),
		defaultExtension: ".yaml",
		formatName: "YAML",
	},
	mermaid: {
		validExtensions: new Set([".mmd", ".mermaid"]),
		defaultExtension: ".mermaid",
		formatName: "Mermaid diagram",
	},
} as const satisfies Record<FileFormatType, FileFormatSpec>;

/**
 * Gets the default file extension for a given format type.
 */
export function getFormatExtension(formatType: FileFormatType): string {
	return fileFormatMap[formatType].defaultExtension;
}

/**
 * Infers the format type from a file extension.
 * Returns undefined if the extension is not recognized.
 */
export function inferFormatFromExtension(extension: string): FileFormatType | undefined {
	const ext = extension.toLowerCase();

	for (const [formatType, spec] of Object.entries(fileFormatMap)) {
		if (isValidValue(spec.validExtensions, ext)) {
			return formatType as FileFormatType;
		}
	}

	return undefined;
}
