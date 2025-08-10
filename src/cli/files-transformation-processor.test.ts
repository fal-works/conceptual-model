import assert from "node:assert";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";
import { beforeEach, describe, it } from "node:test";
import type { FileFormatType } from "./file-sys/file-format.ts";
import { inferFormatFromExtension } from "./file-sys/file-format.ts";
import { processFiles } from "./files-transformation-processor.ts";
import type {
	FileTransformer,
	InputParams,
	InputProcessingParams,
	ModelSpecificResult,
	OutputParams,
	UnresolvedModelSpecificOptions,
} from "./types.ts";

/**
 * Helper function to detect input format for tests.
 * Replaces the old detectFormatForTest function.
 */
function detectFormatForTest(filePath: string): FileFormatType {
	const ext = extname(filePath).toLowerCase();
	const format = inferFormatFromExtension(ext);
	if (!format) {
		throw new Error(`Unsupported file extension: ${ext}`);
	}
	return format;
}

/**
 * Test transformer that simulates class-model to mermaid transformation.
 */
const testTransformer: FileTransformer<FileFormatType, FileFormatType> = (
	content: string,
	_inputParams: InputParams<FileFormatType>,
	outputParams: OutputParams<FileFormatType>,
	_modelOptions: UnresolvedModelSpecificOptions,
): string => {
	// Simple transformation for testing
	if (outputParams.targetType === "mermaid") {
		// Simulate validation error
		if (content.includes('"invalid"')) {
			throw new Error("validation failed");
		}

		// Parse content to extract class names
		let className = "TestClass";
		try {
			// For YAML: nodes:\n  ClassName:
			const yamlMatch = content.match(/nodes:\s*[\n\r\s]+(\w+):/);
			// For JSON: "nodes":{"ClassName":
			const jsonMatch = content.match(/"nodes":\s*{\s*"(\w+)":/);
			// For one-line YAML: nodes: { ClassName: ... }
			const oneLineMatch = content.match(/nodes:\s*{[^}]*?(\w+):/);

			if (yamlMatch) {
				className = yamlMatch[1];
			} else if (jsonMatch) {
				className = jsonMatch[1];
			} else if (oneLineMatch) {
				className = oneLineMatch[1];
			}
		} catch (_e) {
			// Use default if parsing fails
		}

		const labelModifier = _modelOptions.autoClassLabels ? '["user account"]' : "";
		return `classDiagram\\n  class ${className}${labelModifier}`;
	}
	return content;
};

/**
 * Helper to create ModelSpecificResult for tests.
 */
function createTestModelResult(
	inputProcessingParams: InputProcessingParams<FileFormatType>,
	outputParams: OutputParams<FileFormatType>,
	modelOptions: UnresolvedModelSpecificOptions = {},
): ModelSpecificResult<FileFormatType, FileFormatType> {
	return {
		inputProcessingParams,
		outputParams,
		transformer: testTransformer,
		modelOptions,
	};
}

describe("pattern-processor", () => {
	let tempDir: string;
	let testCounter = 1;

	beforeEach(() => {
		tempDir = `test-out/pattern-processor-${testCounter.toString().padStart(3, "0")}`;
		mkdirSync(tempDir, { recursive: true });
		testCounter++;
	});

	describe("processFiles", () => {
		it("should process single file with stdout", async () => {
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
				const outputParams: OutputParams<FileFormatType> = {
					targetType: "mermaid",
					outputStrategy: "stdout",
				};

				const inputParams: InputParams<FileFormatType>[] = [
					{
						filePath: inputFile,
						sourceType: detectFormatForTest(inputFile),
					},
				];

				const modelOptions: UnresolvedModelSpecificOptions = {};
				const modelResult = createTestModelResult(
					{ type: "single", file: inputParams[0] },
					outputParams,
					modelOptions,
				);
				await processFiles(modelResult);

				assert.ok(output.includes("classDiagram"));
			} finally {
				console.log = originalLog;
			}
		});

		it("should error when processing multiple files with stdout strategy", async () => {
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

			const outputParams: OutputParams<FileFormatType> = {
				targetType: "mermaid",
				outputStrategy: "stdout",
			};

			const inputParams: InputParams<FileFormatType>[] = [
				{ filePath: file1, sourceType: detectFormatForTest(file1) },
				{ filePath: file2, sourceType: detectFormatForTest(file2) },
			];

			const modelOptions: UnresolvedModelSpecificOptions = {};
			await assert.rejects(
				() =>
					processFiles(
						createTestModelResult(
							{ type: "multiple", files: inputParams },
							outputParams,
							modelOptions,
						),
					),
				/When using glob patterns, you must specify either --output \(directory\) or --save option/,
			);
		});

		it("should process multiple files with save-in-place strategy", async () => {
			const yamlContent = `
nodes:
  TestClass:
    label: Test Class
			`.trim();

			// Create multiple files
			const file1 = join(tempDir, "model1.yaml");
			const file2 = join(tempDir, "model2.yaml");
			writeFileSync(file1, yamlContent);
			writeFileSync(file2, yamlContent);

			const outputParams: OutputParams<FileFormatType> = {
				targetType: "mermaid",
				outputStrategy: { type: "save-in-place" },
			};

			const inputParams: InputParams<FileFormatType>[] = [
				{ filePath: file1, sourceType: detectFormatForTest(file1) },
				{ filePath: file2, sourceType: detectFormatForTest(file2) },
			];

			const modelOptions: UnresolvedModelSpecificOptions = {};
			const modelResult = createTestModelResult(
				{ type: "multiple", files: inputParams },
				outputParams,
				modelOptions,
			);
			await processFiles(modelResult);

			// Check that output files were created
			const output1 = join(tempDir, "model1.mermaid");
			const output2 = join(tempDir, "model2.mermaid");
			assert.ok(existsSync(output1));
			assert.ok(existsSync(output2));

			const content1 = readFileSync(output1, "utf-8");
			const content2 = readFileSync(output2, "utf-8");
			assert.ok(content1.includes("classDiagram"));
			assert.ok(content2.includes("classDiagram"));
		});

		it("should process multiple files with output-directory strategy", async () => {
			const yamlContent = `
nodes:
  AnotherClass:
    label: Another Class
			`.trim();

			// Create files in a subdirectory
			const subDir = join(tempDir, "models");
			mkdirSync(subDir, { recursive: true });
			const file1 = join(subDir, "model1.yaml");
			const file2 = join(subDir, "model2.yaml");
			writeFileSync(file1, yamlContent);
			writeFileSync(file2, yamlContent);

			const outputDir = join(tempDir, "output");
			const outputParams: OutputParams<FileFormatType> = {
				targetType: "mermaid",
				outputStrategy: { type: "output-directory", path: outputDir },
			};

			const inputParams: InputParams<FileFormatType>[] = [
				{ filePath: file1, sourceType: detectFormatForTest(file1) },
				{ filePath: file2, sourceType: detectFormatForTest(file2) },
			];

			const modelOptions: UnresolvedModelSpecificOptions = {};
			const modelResult = createTestModelResult(
				{ type: "multiple", files: inputParams },
				outputParams,
				modelOptions,
			);
			await processFiles(modelResult);

			// Check that output files were created in the output directory
			const output1 = join(outputDir, "model1.mermaid");
			const output2 = join(outputDir, "model2.mermaid");
			assert.ok(existsSync(output1));
			assert.ok(existsSync(output2));

			const content1 = readFileSync(output1, "utf-8");
			const content2 = readFileSync(output2, "utf-8");
			assert.ok(content1.includes("classDiagram"));
			assert.ok(content2.includes("classDiagram"));
		});

		it("should handle single file with specific-file strategy", async () => {
			const yamlContent = `
nodes:
  SingleClass:
    label: Single Class
			`.trim();
			const inputFile = join(tempDir, "single-model.yaml");
			const outputFile = join(tempDir, "output.mermaid");
			writeFileSync(inputFile, yamlContent);

			const outputParams: OutputParams<FileFormatType> = {
				targetType: "mermaid",
				outputStrategy: { type: "specific-file", path: outputFile },
			};

			const inputParams: InputParams<FileFormatType>[] = [
				{
					filePath: inputFile,
					sourceType: detectFormatForTest(inputFile),
				},
			];

			const modelOptions: UnresolvedModelSpecificOptions = {};
			const modelResult = createTestModelResult(
				{ type: "single", file: inputParams[0] },
				outputParams,
				modelOptions,
			);
			await processFiles(modelResult);

			assert.ok(existsSync(outputFile));
			const content = readFileSync(outputFile, "utf-8");
			assert.ok(content.includes("classDiagram"));
			assert.ok(content.includes("class SingleClass"));
		});

		it("should handle validation errors gracefully", async () => {
			const validYaml = `nodes: { ValidClass: {} }`;
			const invalidYaml = `nodes: "invalid"`;

			// Create one valid and one invalid file
			const validFile = join(tempDir, "valid.yaml");
			const invalidFile = join(tempDir, "invalid.yaml");
			writeFileSync(validFile, validYaml);
			writeFileSync(invalidFile, invalidYaml);

			let consoleOutput = "";
			let errorOutput = "";
			const originalLog = console.log;
			const originalError = console.error;

			console.log = (msg: string) => {
				consoleOutput += `${msg}\\n`;
			};
			console.error = (msg: string) => {
				errorOutput += `${msg}\\n`;
			};

			try {
				const outputParams: OutputParams<FileFormatType> = {
					targetType: "mermaid",
					outputStrategy: { type: "save-in-place" },
				};

				const inputParams: InputParams<FileFormatType>[] = [
					{ filePath: validFile, sourceType: detectFormatForTest(validFile) },
					{ filePath: invalidFile, sourceType: detectFormatForTest(invalidFile) },
				];

				const modelOptions: UnresolvedModelSpecificOptions = {};
				const modelResult = createTestModelResult(
					{ type: "multiple", files: inputParams },
					outputParams,
					modelOptions,
				);
				await processFiles(modelResult);

				// Should process valid file successfully
				assert.ok(existsSync(join(tempDir, "valid.mermaid")));
				// Should report error for invalid file
				assert.ok(errorOutput.includes("invalid.yaml"));
				// Should report summary
				assert.ok(consoleOutput.includes("Processed 1 file(s) successfully"));
				assert.ok(consoleOutput.includes("Failed to process 1 file(s)"));
			} finally {
				console.log = originalLog;
				console.error = originalError;
			}
		});

		it("should handle glob pattern matching single file correctly", async () => {
			const yamlContent = `
nodes:
  SingleGlobMatch:
    label: Single Glob Match
			`.trim();

			// Create a unique filename that can be matched with a glob pattern
			const inputFile = join(tempDir, "unique-glob-test.yaml");
			const outputFile = join(tempDir, "output-single-glob.mermaid");
			writeFileSync(inputFile, yamlContent);

			const outputParams: OutputParams<FileFormatType> = {
				targetType: "mermaid",
				outputStrategy: { type: "specific-file", path: outputFile },
			};

			const inputParams: InputParams<FileFormatType>[] = [
				{
					filePath: inputFile,
					sourceType: detectFormatForTest(inputFile),
				},
			];

			// Even though there's only one file, it was matched via glob pattern
			const modelOptions: UnresolvedModelSpecificOptions = {};
			const modelResult = createTestModelResult(
				{ type: "multiple", files: inputParams },
				outputParams,
				modelOptions,
			);
			await processFiles(modelResult);

			assert.ok(existsSync(outputFile));
			const content = readFileSync(outputFile, "utf-8");
			assert.ok(content.includes("classDiagram"));
			assert.ok(content.includes("class SingleGlobMatch"));

			// Should show summary for glob pattern even with single file
			let consoleOutput = "";
			const originalLog = console.log;
			console.log = (msg: string) => {
				consoleOutput += `${msg}\\n`;
			};

			try {
				// Process again to capture console output
				const modelResult = createTestModelResult(
					{ type: "multiple", files: inputParams },
					outputParams,
					modelOptions,
				);
				await processFiles(modelResult);
				assert.ok(consoleOutput.includes("Processed 1 file(s) successfully"));
			} finally {
				console.log = originalLog;
			}
		});

		it("should apply transformation options correctly", async () => {
			const yamlContent = `
nodes:
  UserAccount:
    attributes:
      - username
			`.trim();
			const inputFile = join(tempDir, "user-model.yaml");
			const outputFile = join(tempDir, "user-output.mermaid");
			writeFileSync(inputFile, yamlContent);

			const outputParams: OutputParams<FileFormatType> = {
				targetType: "mermaid",
				outputStrategy: { type: "specific-file", path: outputFile },
			};

			const inputParams: InputParams<FileFormatType>[] = [
				{
					filePath: inputFile,
					sourceType: detectFormatForTest(inputFile),
				},
			];

			const modelOptions: UnresolvedModelSpecificOptions = { autoClassLabels: true };
			const modelResult = createTestModelResult(
				{ type: "single", file: inputParams[0] },
				outputParams,
				modelOptions,
			);
			await processFiles(modelResult);
			const content = readFileSync(outputFile, "utf-8");
			assert.ok(content.includes('UserAccount["user account"]'));
		});
	});
});
