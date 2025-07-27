import { cac } from "cac";
import { transformFileToFile } from "./file-to-file.ts";

/**
 * Creates and configures the CLI application.
 */
export function createCLI(): ReturnType<typeof cac> {
	const cli = cac("conceptual-model");

	// Class model to Mermaid command
	cli
		.command(
			"class-model-to-mermaid <input>",
			"Transform class model (YAML/JSON) to Mermaid diagram",
		)
		.option("-o, --output <file>", "Output file path (optional, defaults to stdout)")
		.option(
			"-s, --save",
			"Save to file with same name but .mermaid extension (ignored if -o is used)",
		)
		.action((input, options) => {
			transformFileToFile(input, options, "class-model-to-mermaid");
		})
		.example("conceptual-model class-model-to-mermaid model.yaml")
		.example("conceptual-model class-model-to-mermaid model.json")
		.example("conceptual-model class-model-to-mermaid -o diagram.mermaid model.yaml")
		.example("conceptual-model class-model-to-mermaid --save model.json");

	cli.help();
	cli.version("0.1.0");

	return cli;
}
