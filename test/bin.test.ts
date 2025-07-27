import assert from "node:assert";
import { execFile } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, it } from "node:test";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const execBin = (...args: string[]) => execFileAsync("node", ["src/bin.ts", ...args]);

describe("CLI Integration Tests", () => {
	describe("class-model-to-mermaid command", () => {
		it("should show help when no arguments provided", async () => {
			const { stdout } = await execBin("--help");

			assert.ok(stdout.includes("class-model-to-mermaid"));
			assert.ok(stdout.includes("Transform class model (YAML/JSON) to Mermaid diagram"));
		});

		it("should accept YAML input and output to stdout", async () => {
			const { stdout } = await execBin("class-model-to-mermaid", "test/fixtures/simple-model.yaml");

			assert.ok(stdout.includes("classDiagram"));
		});

		it("should accept JSON input and output to stdout", async () => {
			const { stdout } = await execBin("class-model-to-mermaid", "test/fixtures/simple-model.json");

			assert.ok(stdout.includes("classDiagram"));
		});

		it("should accept --save option and create output file", async () => {
			const { stdout } = await execBin(
				"class-model-to-mermaid",
				"--save",
				"test/fixtures/simple-model.yaml",
			);

			assert.ok(stdout.includes("Mermaid diagram written to:"));
			// Output file is created in same directory as input
			assert.ok(existsSync("test/fixtures/simple-model.mermaid"));
		});

		it("should show error for unsupported file extension", async () => {
			try {
				await execBin("class-model-to-mermaid", "test/fixtures/nonexistent.txt");
				assert.fail("Should have thrown an error");
			} catch (error: any) {
				assert.ok(error.stderr.includes("Unsupported input format"));
			}
		});

		describe("with custom output files", () => {
			let tempDir: string;
			let testCounter = 1;

			beforeEach(() => {
				tempDir = `test-out/cli-${testCounter.toString().padStart(3, "0")}`;
				mkdirSync(tempDir, { recursive: true });
				testCounter++;
			});

			it("should accept -o option for custom output file", async () => {
				const outputFile = join(tempDir, "custom-output.mmd");

				const { stdout } = await execBin(
					"class-model-to-mermaid",
					"-o",
					outputFile,
					"test/fixtures/simple-model.json",
				);

				assert.ok(stdout.includes("Mermaid diagram written to:"));
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
	});
});
