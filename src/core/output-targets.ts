import type { OutputTargetType } from "./types.ts";

/**
 * Specification for a single output target.
 */
interface OutputTargetSpec {
	validOutputExtensions: string[];
	defaultOutputExtension: string;
	outputFormatName: string;
}

/**
 * Registry of all supported output targets with their configurations.
 */
export const outputTargets = {
	mermaid: {
		validOutputExtensions: [".mmd", ".mermaid"],
		defaultOutputExtension: ".mermaid",
		outputFormatName: "Mermaid diagram",
	},
} as const satisfies Record<OutputTargetType, OutputTargetSpec>;
