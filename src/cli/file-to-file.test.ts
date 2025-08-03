import assert from "node:assert";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, it } from "node:test";
import { transformFileToFile } from "./file-to-file.ts";

describe("file-to-file", () => {
	let tempDir: string;
	let testInputFile: string;
	let testOutputFile: string;
	let testCounter = 1;

	beforeEach(() => {
		tempDir = `test-out/file-to-file-${testCounter.toString().padStart(3, "0")}`;
		mkdirSync(tempDir, { recursive: true });
		testInputFile = join(tempDir, "test-model.yaml");
		testOutputFile = join(tempDir, "output.mermaid");
		testCounter++;
	});

	describe("transformFileToFile", () => {
		it("should write to stdout", () => {
			const yamlContent = `
nodes:
  Book:
    label: Book
			`.trim();
			writeFileSync(testInputFile, yamlContent);

			let output = "";
			const originalLog = console.log;
			console.log = (msg: string) => {
				output = msg;
			};

			try {
				// Test with actual class-model -> mermaid transformation
				transformFileToFile(testInputFile, {}, "class-model-to-mermaid");
				assert.ok(output.includes("classDiagram"));
			} finally {
				console.log = originalLog;
			}
		});

		it("should save to file with --save option", () => {
			const yamlContent = `
nodes:
  Library:
    label: Library
			`.trim();
			writeFileSync(testInputFile, yamlContent);

			let output = "";
			const originalLog = console.log;
			console.log = (msg: string) => {
				output = msg;
			};

			try {
				transformFileToFile(testInputFile, { save: true }, "class-model-to-mermaid");

				assert.ok(output.includes("Mermaid diagram written to:"));
				assert.ok(output.includes("from YAML"));
				const expectedOutput = join(tempDir, "test-model.mermaid");
				assert.ok(existsSync(expectedOutput));

				const content = readFileSync(expectedOutput, "utf-8");
				assert.ok(content.includes("classDiagram"));
			} finally {
				console.log = originalLog;
			}
		});

		it("should save to custom output file", () => {
			const yamlContent = `
nodes:
  Custom:
    label: Custom
			`.trim();
			writeFileSync(testInputFile, yamlContent);

			let output = "";
			const originalLog = console.log;
			console.log = (msg: string) => {
				output = msg;
			};

			try {
				transformFileToFile(testInputFile, { output: testOutputFile }, "class-model-to-mermaid");

				assert.ok(output.includes("Mermaid diagram written to:"));
				assert.ok(output.includes(testOutputFile));
				assert.ok(existsSync(testOutputFile));

				const content = readFileSync(testOutputFile, "utf-8");
				assert.ok(content.includes("classDiagram"));
				assert.ok(content.includes("class Custom"));
			} finally {
				console.log = originalLog;
			}
		});

		it("should throw for invalid output extension", () => {
			writeFileSync(testInputFile, "nodes: {}");

			assert.throws(
				() =>
					transformFileToFile(testInputFile, { output: "invalid.txt" }, "class-model-to-mermaid"),
				/Expected \.mmd or \.mermaid file, but got \.txt/,
			);
		});
	});
});
