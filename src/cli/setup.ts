/**
 * CLI application configuration and command setup.
 */
import { cac } from "cac";
import { processModelCommand } from "./model-commands/index.ts";

/**
 * Creates and configures the CLI application.
 */
export function createCLI(): ReturnType<typeof cac> {
	const cli = cac("conceptual-model");

	// Class model command
	cli
		.command("class-model <input>", "Transform class model files. Supports glob patterns.")
		.option("--source <type>", "Input format type (yaml, json). Auto-detected if not specified.")
		.option(
			"--target <type>",
			"Output format type (mermaid). Required unless output file extension is provided.",
		)
		.option(
			"-o, --output <file|dir>",
			"Output file path for single files, or directory for glob patterns (optional, defaults to stdout)",
		)
		.option(
			"-s, --save",
			"Save to file with same name but appropriate extension (ignored if -o is used)",
		)
		.option(
			"--auto-class-labels",
			"Automatically generate class labels from class names (converts Pascal/camelCase to space-separated lowercase)",
		)
		.action(async (input, options) => {
			await processModelCommand("class-model", input, options);
		})
		.example("conceptual-model class-model --target mermaid model.yaml")
		.example("conceptual-model class-model --source json --target mermaid model.json")
		.example("conceptual-model class-model -o diagram.mermaid model.yaml")
		.example("conceptual-model class-model --save model.json --auto-class-labels")
		.example("conceptual-model class-model --target mermaid --save '**/*.yaml'")
		.example("conceptual-model class-model --target mermaid -o output-dir 'models/*.{yaml,json}'");

	// Default command - show help when no subcommand provided
	cli.command("").action(() => {
		cli.outputHelp();
	});

	cli.help();
	cli.version("0.1.0");

	return cli;
}
