import assert from "node:assert";
import { describe, it } from "node:test";
import { classModelJsonToMermaid, classModelYamlToMermaid } from "./class-model.ts";

describe("class-model", () => {
	describe("yamlToMermaid", () => {
		it("should convert valid YAML to Mermaid diagram", () => {
			const yaml = `
nodes:
  Book:
    label: Book
    attributes:
      - title
      - isbn
  Library:
    label: Library
edges:
  - source: Library
    target: Book
    relation: is-composed-of
`;
			const result = classModelYamlToMermaid(yaml);

			assert.ok(result.includes("classDiagram"));
			assert.ok(result.includes("class Book"));
			assert.ok(result.includes("class Library"));
			assert.ok(result.includes("Library *-- Book"));
		});

		it("should throw error for invalid YAML", () => {
			const invalidYaml = `invalid: [yaml: structure`;

			assert.throws(() => classModelYamlToMermaid(invalidYaml), /Error/);
		});

		it("should throw error for invalid schema", () => {
			const invalidData = `invalid: data`;

			assert.throws(() => classModelYamlToMermaid(invalidData), /Validation failed/);
		});
	});

	describe("jsonToMermaid", () => {
		it("should convert valid JSON to Mermaid diagram", () => {
			const json = JSON.stringify({
				nodes: {
					Book: {
						label: "Book",
						attributes: ["title", "isbn"],
					},
					Library: {
						label: "Library",
					},
				},
				edges: [
					{
						source: "Library",
						target: "Book",
						relation: "is-composed-of",
					},
				],
			});

			const result = classModelJsonToMermaid(json);

			assert.ok(result.includes("classDiagram"));
			assert.ok(result.includes("class Book"));
			assert.ok(result.includes("class Library"));
			assert.ok(result.includes("Library *-- Book"));
		});

		it("should throw error for invalid JSON", () => {
			const invalidJson = `{"invalid": json structure}`;

			assert.throws(() => classModelJsonToMermaid(invalidJson), /Error/);
		});

		it("should throw error for invalid schema", () => {
			const invalidData = JSON.stringify({ invalid: "data" });

			assert.throws(() => classModelJsonToMermaid(invalidData), /Validation failed/);
		});
	});
});
