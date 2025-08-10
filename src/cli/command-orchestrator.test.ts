import assert from "node:assert";
import { describe, it } from "node:test";
import { processModelCommand } from "./command-orchestrator.ts";
import type {
	CommonProcessingParams,
	InputProcessingParams,
	ModelSpecificResult,
} from "./types.ts";

describe("command-orchestrator", () => {
	describe("processModelCommand", () => {
		it("should orchestrate common processing and delegate to model processor", async () => {
			// Mock model processor that captures the common params and returns test result
			let capturedParams: CommonProcessingParams | undefined;
			const mockModelProcessor = (commonParams: CommonProcessingParams) => {
				capturedParams = commonParams;
				return {
					inputProcessingParams:
						commonParams.inputProcessingParams as InputProcessingParams<"json">,
					outputParams: {
						targetType: "mermaid" as const,
						outputStrategy: "stdout" as const,
					},
					transformer: (_content, _input, _output, _options) => "mock result",
					modelOptions: { autoClassLabels: true },
				} as ModelSpecificResult<"json", "mermaid">;
			};

			// Mock raw options
			const rawOptions = {
				target: "mermaid",
				autoClassLabels: true,
			};

			// Test with a pattern that will match package.json (which should exist)
			await processModelCommand("package.json", rawOptions, mockModelProcessor);

			// Verify that common parameters were properly resolved and passed to model processor
			assert(capturedParams, "Model processor should have been called with common params");
			assert.strictEqual(capturedParams.outputParams.targetType, "mermaid");
			assert.strictEqual(capturedParams.modelOptions.autoClassLabels, true);
			assert(
				capturedParams.inputProcessingParams.type === "single",
				"Should have single input processing params",
			);
			if (capturedParams.inputProcessingParams.type === "single") {
				assert.strictEqual(capturedParams.inputProcessingParams.file.filePath, "package.json");
				assert.strictEqual(capturedParams.inputProcessingParams.file.sourceType, "json");
			}
		});

		it("should handle no files found gracefully", async () => {
			const mockModelProcessor = () => {
				throw new Error("Model processor should not be called when no files are found");
			};

			const rawOptions = { target: "mermaid" };

			// Test with a pattern that won't match any files
			await processModelCommand("nonexistent-*.xyz", rawOptions, mockModelProcessor);

			// Should not throw or call the model processor
		});

		it("should resolve explicit source type when provided", async () => {
			let capturedParams: CommonProcessingParams | undefined;
			const mockModelProcessor = (commonParams: CommonProcessingParams) => {
				capturedParams = commonParams;
				return {
					inputProcessingParams: {
						type: "single",
						file: {
							filePath: "package.json",
							sourceType: "json" as const,
						},
					},
					outputParams: {
						targetType: "mermaid" as const,
						outputStrategy: "stdout" as const,
					},
					transformer: () => "mock",
					modelOptions: {},
				} as ModelSpecificResult<"json", "mermaid">;
			};

			const rawOptions = {
				target: "mermaid",
				source: "json",
			};

			await processModelCommand("package.json", rawOptions, mockModelProcessor);

			assert(capturedParams, "Model processor should have been called");
			// Verify that explicit source type was used for format detection
			assert(
				capturedParams.inputProcessingParams.type === "single",
				"Should have single input processing params",
			);
			if (capturedParams.inputProcessingParams.type === "single") {
				assert.strictEqual(capturedParams.inputProcessingParams.file.sourceType, "json");
			}
		});
	});
});
