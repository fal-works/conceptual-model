import assert from "node:assert";
import { describe, it } from "node:test";
import { jsonToMermaid, yamlToMermaid } from "./class-model.ts";

describe("class-model", () => {
	describe("yamlToMermaid", () => {
		it("should convert valid YAML to Mermaid diagram", () => {
			const yaml = `
graph:
  nodes:
    Book:
      label: Book
      metadata:
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
			const result = yamlToMermaid(yaml);

			assert.ok(result.includes("classDiagram"));
			assert.ok(result.includes("class Book"));
			assert.ok(result.includes("class Library"));
			assert.ok(result.includes("Library *-- Book"));
		});

		it("should throw error for invalid YAML", () => {
			const invalidYaml = `invalid: [yaml: structure`;

			assert.throws(() => yamlToMermaid(invalidYaml), /Error/);
		});

		it("should throw error for invalid schema", () => {
			const invalidData = `graph: invalid`;

			assert.throws(() => yamlToMermaid(invalidData), /Validation failed/);
		});
	});

	describe("jsonToMermaid", () => {
		it("should convert valid JSON to Mermaid diagram", () => {
			const json = JSON.stringify({
				graph: {
					nodes: {
						Book: {
							label: "Book",
							metadata: {
								attributes: ["title", "isbn"],
							},
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
				},
			});

			const result = jsonToMermaid(json);

			assert.ok(result.includes("classDiagram"));
			assert.ok(result.includes("class Book"));
			assert.ok(result.includes("class Library"));
			assert.ok(result.includes("Library *-- Book"));
		});

		it("should throw error for invalid JSON", () => {
			const invalidJson = `{"invalid": json structure}`;

			assert.throws(() => jsonToMermaid(invalidJson), /Error/);
		});

		it("should throw error for invalid schema", () => {
			const invalidData = JSON.stringify({ graph: "invalid" });

			assert.throws(() => jsonToMermaid(invalidData), /Validation failed/);
		});
	});
});
