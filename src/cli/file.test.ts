import assert from "node:assert";
import { describe, it } from "node:test";
import { changeExtension, detectInputFormat, validateFileExtension } from "./file.ts";

describe("file", () => {
	describe("validateFileExtension", () => {
		it("should pass for matching extension", () => {
			assert.doesNotThrow(() => {
				validateFileExtension("test.yaml", [".yaml", ".yml"]);
			});
		});

		it("should pass for case insensitive matching", () => {
			assert.doesNotThrow(() => {
				validateFileExtension("test.YAML", [".yaml", ".yml"]);
			});
		});

		it("should throw for non-matching extension", () => {
			assert.throws(
				() => validateFileExtension("test.txt", [".yaml", ".yml"]),
				/Expected \.yaml or \.yml file, but got \.txt/,
			);
		});

		it("should throw for missing extension", () => {
			assert.throws(
				() => validateFileExtension("test", [".yaml"]),
				/Expected \.yaml file, but got no extension/,
			);
		});

		it("should handle single expected extension", () => {
			assert.throws(
				() => validateFileExtension("test.txt", [".yaml"]),
				/Expected \.yaml file, but got \.txt/,
			);
		});
	});

	describe("changeExtension", () => {
		it("should change extension", () => {
			const result = changeExtension("path/to/model.yaml", ".mermaid");
			assert.strictEqual(result, "path\\to\\model.mermaid");
		});

		it("should handle files without directory", () => {
			const result = changeExtension("model.json", ".mmd");
			assert.strictEqual(result, "model.mmd");
		});

		it("should handle nested paths", () => {
			const result = changeExtension("deep/nested/path/file.yml", ".mermaid");
			assert.strictEqual(result, "deep\\nested\\path\\file.mermaid");
		});

		it("should handle files with multiple dots", () => {
			const result = changeExtension("model.test.yaml", ".mermaid");
			assert.strictEqual(result, "model.test.mermaid");
		});
	});

	describe("detectInputFormat", () => {
		it("should detect yaml from .yaml extension", () => {
			assert.strictEqual(detectInputFormat("model.yaml"), "yaml");
		});

		it("should detect yaml from .yml extension", () => {
			assert.strictEqual(detectInputFormat("model.yml"), "yaml");
		});

		it("should detect json from .json extension", () => {
			assert.strictEqual(detectInputFormat("model.json"), "json");
		});

		it("should be case insensitive", () => {
			assert.strictEqual(detectInputFormat("model.YAML"), "yaml");
			assert.strictEqual(detectInputFormat("model.JSON"), "json");
		});

		it("should throw for unsupported extension", () => {
			assert.throws(
				() => detectInputFormat("model.txt"),
				/Unsupported input format: \.txt\. Supported formats: \.yaml, \.yml, \.json/,
			);
		});

		it("should handle files without extension", () => {
			assert.throws(
				() => detectInputFormat("model"),
				/Unsupported input format: \. Supported formats: \.yaml, \.yml, \.json/,
			);
		});
	});
});
