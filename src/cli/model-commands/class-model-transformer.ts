/**
 * Class model content transformation between formats.
 */
import type {
	ClassModelExporterKeys,
	ClassModelImporterKeys,
	MermaidClassDiagramOptions,
} from "../../api/internal.ts";
import { classModelExporters, classModelImporters } from "../../api/internal.ts";
import type { UnresolvedModelSpecificOptions } from "../types.ts";

/**
 * Transforms class-model content from source format to target format.
 * Assumes source and target types have already been validated upstream.
 * @param content - Input content to transform
 * @param sourceType - Validated source format type
 * @param targetType - Validated target format type
 * @param options - Class-model specific transformation options
 * @returns Transformed content as string
 */
export function transformClassModelContent(
	content: string,
	sourceType: ClassModelImporterKeys,
	targetType: ClassModelExporterKeys,
	options: UnresolvedModelSpecificOptions,
): string {
	// Import the model
	const importer = classModelImporters[sourceType];
	const model = importer(content);

	// Switch on target type to prepare appropriate export options
	switch (targetType) {
		case "mermaid": {
			const exporter = classModelExporters[targetType];
			const exportOptions: MermaidClassDiagramOptions = {
				...(options.autoClassLabels !== undefined && { autoClassLabels: options.autoClassLabels }),
			};
			return exporter(model, exportOptions);
		}
		default:
			throw new Error(`Unsupported target type: ${targetType}`);
	}
}
