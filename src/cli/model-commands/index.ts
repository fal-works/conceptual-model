/**
 * Model command registry and dispatch logic.
 */
import { processModelCommand as orchestrateModelCommand } from "../command-orchestrator.ts";
import type { ModelType, RawCommandOptions } from "../types.ts";
import { processClassModelCommand } from "./class-model.ts";

/**
 * Registry of all available model command processors.
 * Maps model types to their specific processor functions.
 */
const modelProcessorRegistry = {
	"class-model": processClassModelCommand,
} as const;

/**
 * Process a model transformation command by orchestrating common logic
 * and delegating to the appropriate model-specific processor.
 */
export async function processModelCommand(
	modelType: ModelType,
	input: string,
	options: RawCommandOptions,
): Promise<void> {
	const processor = modelProcessorRegistry[modelType];

	if (!processor) {
		throw new Error(`Unknown model type: ${modelType}`);
	}

	await orchestrateModelCommand(input, options, processor);
}
