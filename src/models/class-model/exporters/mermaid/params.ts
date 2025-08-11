/**
 * Parameter handling and configuration for Mermaid class diagram generation.
 */

/**
 * Parameters for Mermaid class diagram generation.
 * All properties are required.
 * @package
 */
export interface MermaidClassDiagramParams {
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
 * @package
 */
export const DEFAULT_PARAMS: MermaidClassDiagramParams = {
	autoClassLabels: false,
};

/**
 * Merges user options with defaults to create complete parameters.
 * @package
 */
export function resolveParams(userOptions?: MermaidClassDiagramOptions): MermaidClassDiagramParams {
	return {
		...DEFAULT_PARAMS,
		...userOptions,
	};
}
