import assert from "node:assert";
import { describe, it } from "node:test";
import { changeExtension, expandInputPattern, validateFileExtension } from "./file-path.ts";

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

	describe("expandInputPattern", () => {
		it("should return type=single for direct file paths that exist", async () => {
			// Test with a file that should exist in our project
			const result = await expandInputPattern("package.json");

			assert.strictEqual(result.type, "single");
			if (result.type === "single") {
				assert.strictEqual(result.file, "package.json");
			}
		});

		it("should return type=multiple for patterns with wildcards", async () => {
			// Patterns with wildcards should be detected as globs
			const result1 = await expandInputPattern("*.ts");
			const result2 = await expandInputPattern("src/**/*.ts");
			const result3 = await expandInputPattern("test?.json");

			assert.strictEqual(result1.type, "multiple");
			assert.strictEqual(result2.type, "multiple");
			assert.strictEqual(result3.type, "multiple");
		});

		it("should return type=multiple for patterns that match multiple files", async () => {
			// Even if the pattern doesn't have explicit glob characters,
			// if expansion yields multiple files or different paths, it's a glob
			const result = await expandInputPattern("src/cli/*.ts");
			assert.strictEqual(result.type, "multiple");
			if (result.type === "multiple") {
				assert.ok(result.files.length > 0); // Should find CLI files
			}
		});

		it("should return type=multiple for patterns that match zero files", async () => {
			// Non-existent patterns should be treated as globs
			const result = await expandInputPattern("nonexistent/*.xyz");
			assert.strictEqual(result.type, "multiple");
			if (result.type === "multiple") {
				assert.strictEqual(result.files.length, 0);
			}
		});

		it("should return type=multiple for non-existent single files", async () => {
			// Non-existent files return 0 matches, so they're treated as glob patterns
			const result = await expandInputPattern("nonexistent-file.txt");
			assert.strictEqual(result.type, "multiple");
			if (result.type === "multiple") {
				assert.strictEqual(result.files.length, 0);
			}
		});

		it("should handle edge cases gracefully", async () => {
			// Empty string and space-only patterns return 0 matches, so they're globs
			const result1 = await expandInputPattern("");
			const result2 = await expandInputPattern("   ");

			// These should be treated as glob patterns since they return no matches
			assert.strictEqual(result1.type, "multiple");
			if (result1.type === "multiple") {
				assert.strictEqual(result1.files.length, 0);
			}
			assert.strictEqual(result2.type, "multiple");
			if (result2.type === "multiple") {
				assert.strictEqual(result2.files.length, 0);
			}
		});
	});
});
