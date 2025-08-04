import assert from "node:assert";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, it } from "node:test";
import { processInputPattern } from "./pattern-processor.ts";

describe("pattern-processor", () => {
	let tempDir: string;
	let testCounter = 1;

	beforeEach(() => {
		tempDir = `test-out/pattern-processor-${testCounter.toString().padStart(3, "0")}`;
		mkdirSync(tempDir, { recursive: true });
		testCounter++;
	});

	describe("processInputPattern", () => {
		it("should process single file", async () => {
			const yamlContent = `
nodes:
  Book:
    label: Book
			`.trim();
			const inputFile = join(tempDir, "test-model.yaml");
			writeFileSync(inputFile, yamlContent);

			let output = "";
			const originalLog = console.log;
			console.log = (msg: string) => {
				output = msg;
			};

			try {
				await processInputPattern(inputFile, {}, "class-model", "mermaid");
				assert.ok(output.includes("classDiagram"));
			} finally {
				console.log = originalLog;
			}
		});

		it("should error when glob pattern used but no --output or --save provided", async () => {
			const yamlContent = `
nodes:
  Book:
    label: Book
			`.trim();

			// Create multiple files
			const file1 = join(tempDir, "model1.yaml");
			const file2 = join(tempDir, "model2.yaml");
			writeFileSync(file1, yamlContent);
			writeFileSync(file2, yamlContent);

			// Use forward slashes for glob patterns (cross-platform)
			const globPattern = `${tempDir.replace(/\\/g, "/")}/*.yaml`;
			await assert.rejects(
				() => processInputPattern(globPattern, {}, "class-model", "mermaid"),
				/When using glob patterns, you must specify either --output \(directory\) or --save option/,
			);
		});

		it("should allow single file with no options when pattern has no glob characters", async () => {
			const yamlContent = `
nodes:
  Book:
    label: Book
			`.trim();

			// Create a file with a normal name (no glob characters)
			const fileName = join(tempDir, "model-single.yaml");
			writeFileSync(fileName, yamlContent);

			let output = "";
			const originalLog = console.log;
			console.log = (msg: string) => {
				output = msg;
			};

			try {
				// This should work because it doesn't contain glob chars like * ? {} []
				await processInputPattern(fileName, {}, "class-model", "mermaid");
				assert.ok(output.includes("classDiagram"));
			} finally {
				console.log = originalLog;
			}
		});

		it("should use --save for glob patterns", async () => {
			const yamlContent = `
nodes:
  Library:
    label: Library
			`.trim();

			// Create multiple files
			const file1 = join(tempDir, "model1.yaml");
			const file2 = join(tempDir, "model2.yaml");
			writeFileSync(file1, yamlContent);
			writeFileSync(file2, yamlContent);

			const outputs: string[] = [];
			const originalLog = console.log;
			console.log = (msg: string) => {
				outputs.push(msg);
			};

			try {
				// Use forward slashes for glob patterns (cross-platform)
				const globPattern = `${tempDir.replace(/\\/g, "/")}/*.yaml`;
				await processInputPattern(globPattern, { save: true }, "class-model", "mermaid");

				// Should have created output files
				assert.ok(existsSync(join(tempDir, "model1.mermaid")));
				assert.ok(existsSync(join(tempDir, "model2.mermaid")));

				// Should have logged file creation messages
				assert.ok(outputs.some((msg) => msg.includes("model1.mermaid")));
				assert.ok(outputs.some((msg) => msg.includes("model2.mermaid")));
			} finally {
				console.log = originalLog;
			}
		});

		it("should use --output as directory for glob patterns", async () => {
			const yamlContent = `
nodes:
  Test:
    label: Test
			`.trim();

			// Create multiple files
			const file1 = join(tempDir, "input1.yaml");
			const file2 = join(tempDir, "input2.yaml");
			writeFileSync(file1, yamlContent);
			writeFileSync(file2, yamlContent);

			const outputDir = join(tempDir, "output");
			const outputs: string[] = [];
			const originalLog = console.log;
			console.log = (msg: string) => {
				outputs.push(msg);
			};

			try {
				// Use forward slashes for glob patterns (cross-platform)
				const globPattern = `${tempDir.replace(/\\/g, "/")}/*.yaml`;
				await processInputPattern(globPattern, { output: outputDir }, "class-model", "mermaid");

				// Should have created output files in the specified directory
				assert.ok(existsSync(join(outputDir, "input1.mermaid")));
				assert.ok(existsSync(join(outputDir, "input2.mermaid")));

				// Should have logged file creation messages with full paths
				assert.ok(outputs.some((msg) => msg.includes(join(outputDir, "input1.mermaid"))));
				assert.ok(outputs.some((msg) => msg.includes(join(outputDir, "input2.mermaid"))));
			} finally {
				console.log = originalLog;
			}
		});

		it("should error when glob pattern matches unsupported extensions", async () => {
			// Create a file with unsupported extension
			const txtFile = join(tempDir, "test.txt");
			writeFileSync(txtFile, "some content");

			// Use forward slashes for glob patterns (cross-platform)
			const globPattern = `${tempDir.replace(/\\/g, "/")}/*.txt`;
			await assert.rejects(
				() => processInputPattern(globPattern, { save: true }, "class-model", "mermaid"),
				/File.*test\.txt.*has unsupported extension/,
			);
		});

		it("should inform user when no files match pattern", async () => {
			// Use forward slashes for glob patterns (cross-platform)
			const globPattern = `${tempDir.replace(/\\/g, "/")}/*.nonexistent`;

			let output = "";
			const originalLog = console.log;
			console.log = (msg: string) => {
				output = msg;
			};

			try {
				await processInputPattern(globPattern, {}, "class-model", "mermaid");
				assert.ok(output.includes("No files found matching pattern"));
				assert.ok(output.includes("*.nonexistent"));
			} finally {
				console.log = originalLog;
			}
		});

		it("should handle single file that doesn't exist gracefully", async () => {
			// This should let the underlying transformFileToFile handle the error
			await assert.rejects(
				() => processInputPattern(join(tempDir, "nonexistent.yaml"), {}, "class-model", "mermaid"),
				/ENOENT|no such file or directory/,
			);
		});
	});
});
