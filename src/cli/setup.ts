import { cac } from "cac";
import { processInputPattern } from "./pattern-processor.ts";

/**
 * Creates and configures the CLI application.
 */
export function createCLI(): ReturnType<typeof cac> {
	const cli = cac("conceptual-model");

	// Class model to Mermaid command
	cli
		.command(
			"class-model-to-mermaid <input>",
			"Transform class model (YAML/JSON) to Mermaid diagram. Supports glob patterns.",
		)
		.option(
			"-o, --output <file|dir>",
			"Output file path for single files, or directory for glob patterns (optional, defaults to stdout)",
		)
		.option(
			"-s, --save",
			"Save to file with same name but .mermaid extension (ignored if -o is used)",
		)
		.action(async (input, options) => {
			await processInputPattern(input, options, "class-model-to-mermaid");
		})
		.example("conceptual-model class-model-to-mermaid model.yaml")
		.example("conceptual-model class-model-to-mermaid model.json")
		.example("conceptual-model class-model-to-mermaid -o diagram.mermaid model.yaml")
		.example("conceptual-model class-model-to-mermaid --save model.json")
		.example("conceptual-model class-model-to-mermaid --save '**/*.yaml'")
		.example("conceptual-model class-model-to-mermaid -o output-dir 'models/*.{yaml,json}'");

	// Default command - show help when no subcommand provided
	cli.command("").action(() => {
		cli.outputHelp();
	});

	cli.help();
	cli.version("0.1.0");

	return cli;
}
