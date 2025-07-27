import assert from "node:assert";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, it } from "node:test";
import { convertClassModelToMermaid, convertModel } from "./actions.ts";

describe("actions", () => {
	let tempDir: string;
	let testInputFile: string;
	let testOutputFile: string;
	let testCounter = 1;

	beforeEach(() => {
		tempDir = `test-out/actions-${testCounter.toString().padStart(3, "0")}`;
		mkdirSync(tempDir, { recursive: true });
		testInputFile = join(tempDir, "test-model.yaml");
		testOutputFile = join(tempDir, "output.mermaid");
		testCounter++;
	});

	describe("convertModel", () => {
		it("should convert to stdout", () => {
			const yamlContent = `
graph:
  nodes:
    Book:
      label: Book
  edges: []
			`.trim();
			writeFileSync(testInputFile, yamlContent);

			let output = "";
			const originalLog = console.log;
			console.log = (msg: string) => {
				output = msg;
			};

			try {
				// Test with actual class-model -> mermaid conversion
				convertModel(testInputFile, {}, "class-model", "mermaid");
				assert.ok(output.includes("classDiagram"));
			} finally {
				console.log = originalLog;
			}
		});

		it("should save to file with --save option", () => {
			const yamlContent = `
graph:
  nodes:
    Library:
      label: Library
  edges: []
			`.trim();
			writeFileSync(testInputFile, yamlContent);

			let output = "";
			const originalLog = console.log;
			console.log = (msg: string) => {
				output = msg;
			};

			try {
				convertModel(testInputFile, { save: true }, "class-model", "mermaid");

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

		it("should throw for invalid output extension", () => {
			writeFileSync(testInputFile, "graph:\n  nodes: {}\n  edges: []");

			assert.throws(
				() => convertModel(testInputFile, { output: "invalid.txt" }, "class-model", "mermaid"),
				/Expected \.mmd or \.mermaid file, but got \.txt/,
			);
		});
	});

	describe("convertClassModelToMermaid", () => {
		it("should convert YAML to stdout", () => {
			// Create test YAML file
			const yamlContent = `
graph:
  nodes:
    Book:
      label: Book
  edges: []
			`.trim();
			writeFileSync(testInputFile, yamlContent);

			let output = "";
			const originalLog = console.log;
			console.log = (msg: string) => {
				output = msg;
			};

			try {
				convertClassModelToMermaid(testInputFile, {});
				assert.ok(output.includes("classDiagram"));
				assert.ok(output.includes("class Book"));
			} finally {
				console.log = originalLog;
			}
		});

		it("should save to file with --save option", () => {
			const yamlContent = `
graph:
  nodes:
    Library:
      label: Library
  edges: []
			`.trim();
			writeFileSync(testInputFile, yamlContent);

			let output = "";
			const originalLog = console.log;
			console.log = (msg: string) => {
				output = msg;
			};

			try {
				convertClassModelToMermaid(testInputFile, { save: true });

				assert.ok(output.includes("Mermaid diagram written to:"));
				assert.ok(output.includes("from YAML"));
				const expectedOutput = join(tempDir, "test-model.mermaid");
				assert.ok(existsSync(expectedOutput));

				const content = readFileSync(expectedOutput, "utf-8");
				assert.ok(content.includes("classDiagram"));
				assert.ok(content.includes("class Library"));
			} finally {
				console.log = originalLog;
			}
		});

		it("should save to custom output file", () => {
			const yamlContent = `
graph:
  nodes:
    Custom:
      label: Custom
  edges: []
			`.trim();
			writeFileSync(testInputFile, yamlContent);

			let output = "";
			const originalLog = console.log;
			console.log = (msg: string) => {
				output = msg;
			};

			try {
				convertClassModelToMermaid(testInputFile, { output: testOutputFile });

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
			writeFileSync(testInputFile, "graph:\n  nodes: {}\n  edges: []");

			assert.throws(
				() => convertClassModelToMermaid(testInputFile, { output: "invalid.txt" }),
				/Expected \.mmd or \.mermaid file, but got \.txt/,
			);
		});
	});
});
