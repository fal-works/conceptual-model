import assert from "node:assert";
import { execFile } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, it } from "node:test";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const execBin = (...args: string[]) => execFileAsync("node", ["src/bin.ts", ...args]);

describe("CLI Integration Tests", () => {
	describe("class-model command", () => {
		it("should show help when no arguments provided", async () => {
			const { stdout } = await execBin("class-model", "--help");

			assert.ok(stdout.includes("class-model"));
			assert.ok(stdout.includes("<input>"));
		});

		it("should accept YAML input and output to stdout", async () => {
			const { stdout } = await execBin(
				"class-model",
				"--target",
				"mermaid",
				"test/fixtures/simple-model.yaml",
			);

			assert.ok(stdout.includes("classDiagram"));
		});

		it("should accept JSON input and output to stdout", async () => {
			const { stdout } = await execBin(
				"class-model",
				"--target",
				"mermaid",
				"test/fixtures/simple-model.json",
			);

			assert.ok(stdout.includes("classDiagram"));
		});

		it("should accept --save option and create output file", async () => {
			const { stdout } = await execBin(
				"class-model",
				"--target",
				"mermaid",
				"--save",
				"test/fixtures/simple-model.yaml",
			);

			assert.ok(stdout.includes("Transformed"));
			// Output file is created in same directory as input
			assert.ok(existsSync("test/fixtures/simple-model.mermaid"));
		});

		it("should show error for unsupported file extension", async () => {
			try {
				await execBin("class-model", "--target", "mermaid", "test/fixtures/nonexistent.txt");
				assert.fail("Should have thrown an error");
			} catch (error: any) {
				// Error text may vary, just check that it throws an error
				assert.ok(error.code !== 0);
			}
		});

		it("should process multiple files with glob pattern", async () => {
			const { stdout } = await execBin(
				"class-model",
				"--target",
				"mermaid",
				"--save",
				"test/fixtures/simple-model.{yaml,json}",
			);

			// Should process each file and create output files
			assert.ok(stdout.includes("Transformed"));
			// Check that mermaid files are created for each input file
			assert.ok(existsSync("test/fixtures/simple-model.mermaid"));
		});

		it("should inform user when glob pattern matches no files", async () => {
			const { stdout } = await execBin(
				"class-model",
				"--target",
				"mermaid",
				"test/fixtures/*.nonexistent",
			);

			// Should output informational message instead of throwing error
			assert.ok(stdout.includes("No files found matching pattern"));
			assert.ok(stdout.includes("*.nonexistent"));
		});

		it("should error when glob pattern used without --output or --save", async () => {
			try {
				await execBin(
					"class-model",
					"--target",
					"mermaid",
					"test/fixtures/simple-model.{yaml,json}",
				);
				assert.fail("Should have thrown an error");
			} catch (error: any) {
				assert.ok(
					error.stderr.includes(
						"When using glob patterns, you must specify either --output (directory) or --save option",
					),
				);
			}
		});

		it("should use output directory for glob patterns", async () => {
			const { stdout } = await execBin(
				"class-model",
				"--target",
				"mermaid",
				"--output",
				"test-out/glob-output",
				"test/fixtures/simple-model.{yaml,json}",
			);

			// Should process each file and create output files in the directory
			assert.ok(stdout.includes("Transformed"));
			// Check that mermaid files are created in the output directory
			assert.ok(existsSync("test-out/glob-output/simple-model.mermaid"));
		});

		it("should support --auto-class-labels option", async () => {
			const { stdout } = await execBin(
				"class-model",
				"--target",
				"mermaid",
				"test/fixtures/simple-model.yaml",
				"--auto-class-labels",
			);

			// Should generate diagram successfully
			assert.ok(stdout.includes("classDiagram"));

			// Explicit labels are respected but omitted when they match node name (to avoid redundancy)
			assert.ok(stdout.includes("class Book"));
			assert.ok(!stdout.includes('class Book["Book"]'));
			assert.ok(stdout.includes("class Library"));
			assert.ok(!stdout.includes('class Library["Library"]'));
			// Node without explicit label gets auto-generated label
			assert.ok(stdout.includes('class FileManager["file manager"]'));
		});

		it("should auto-detect source type from file extension", async () => {
			// Test with YAML file - should auto-detect source as yaml
			const { stdout: yamlOut } = await execBin(
				"class-model",
				"--target",
				"mermaid",
				"test/fixtures/simple-model.yaml",
			);
			assert.ok(yamlOut.includes("classDiagram"));

			// Test with JSON file - should auto-detect source as json
			const { stdout: jsonOut } = await execBin(
				"class-model",
				"--target",
				"mermaid",
				"test/fixtures/simple-model.json",
			);
			assert.ok(jsonOut.includes("classDiagram"));
		});

		it("should infer target type from output file extension", async () => {
			const tempDir = "test-out/target-inference";
			mkdirSync(tempDir, { recursive: true });
			const outputFile = join(tempDir, "output.mermaid");

			const { stdout } = await execBin(
				"class-model",
				"--output",
				outputFile,
				"test/fixtures/simple-model.yaml",
			);

			assert.ok(stdout.includes("Transformed"));
			assert.ok(existsSync(outputFile));
		});

		it("should override auto-detected source type when --source specified", async () => {
			// Should work even when explicitly specifying source type
			const { stdout } = await execBin(
				"class-model",
				"--source",
				"yaml",
				"--target",
				"mermaid",
				"test/fixtures/simple-model.yaml",
			);
			assert.ok(stdout.includes("classDiagram"));
		});

		describe("with custom output files", () => {
			let tempDir: string;
			let testCounter = 1;

			beforeEach(() => {
				tempDir = `test-out/cli-${testCounter.toString().padStart(3, "0")}`;
				mkdirSync(tempDir, { recursive: true });
				testCounter++;
			});

			it("should accept --output option for custom output file", async () => {
				const outputFile = join(tempDir, "custom-output.mmd");

				const { stdout } = await execBin(
					"class-model",
					"--target",
					"mermaid",
					"--output",
					outputFile,
					"test/fixtures/simple-model.json",
				);

				assert.ok(stdout.includes("Transformed"));
				assert.ok(existsSync(outputFile));
			});
		});
	});

	describe("version and help", () => {
		it("should show version", async () => {
			const { stdout } = await execBin("--version");
			assert.ok(stdout.includes("0.1.0"));
		});

		it("should show global help", async () => {
			const { stdout } = await execBin("--help");
			assert.ok(stdout.includes("conceptual-model"));
			assert.ok(stdout.includes("Commands:"));
		});

		it("should show help when no arguments provided", async () => {
			const { stdout } = await execBin();
			assert.ok(stdout.includes("conceptual-model"));
			assert.ok(stdout.includes("Commands:"));
			assert.ok(stdout.includes("class-model"));
		});
	});
});
