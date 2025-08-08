import assert from "node:assert";
import { describe, it } from "node:test";
import type { ClassModel } from "../models/class-model/index.ts";
import {
	classModelJsonToMermaid,
	classModelToMermaid,
	classModelYamlToMermaid,
	parseAndValidateClassModelJson,
	parseAndValidateClassModelYaml,
} from "./class-model.ts";

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
			const invalidData = `edges: "not an array"`;

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
			const invalidData = JSON.stringify({ edges: "not an array" });

			assert.throws(() => classModelJsonToMermaid(invalidData), /Validation failed/);
		});
	});

	describe("parseAndValidateClassModelYaml", () => {
		it("should parse and validate valid YAML", () => {
			const yaml = `
nodes:
  User:
    attributes:
      - "id: string"
      - "name: string"
edges: []
`;
			const result = parseAndValidateClassModelYaml(yaml);
			assert.ok(result);
			assert.strictEqual(result.nodes?.User?.attributes?.length, 2);
		});

		it("should throw error for invalid YAML syntax", () => {
			const invalidYaml = `{ invalid: yaml syntax`;
			assert.throws(() => parseAndValidateClassModelYaml(invalidYaml), /Error/);
		});

		it("should throw error for invalid schema", () => {
			const invalidData = `nodes: "should be object"`;
			assert.throws(() => parseAndValidateClassModelYaml(invalidData), /Validation failed/);
		});
	});

	describe("parseAndValidateClassModelJson", () => {
		it("should parse and validate valid JSON", () => {
			const json = JSON.stringify({
				nodes: {
					User: {
						attributes: ["id: string", "name: string"],
					},
				},
				edges: [],
			});
			const result = parseAndValidateClassModelJson(json);
			assert.ok(result);
			assert.strictEqual(result.nodes?.User?.attributes?.length, 2);
		});

		it("should throw error for invalid JSON syntax", () => {
			const invalidJson = `{ invalid: json syntax`;
			assert.throws(() => parseAndValidateClassModelJson(invalidJson), /Error/);
		});

		it("should throw error for invalid schema", () => {
			const invalidData = JSON.stringify({ nodes: "should be object" });
			assert.throws(() => parseAndValidateClassModelJson(invalidData), /Validation failed/);
		});
	});

	describe("classModelToMermaid", () => {
		it("should convert ClassModel to Mermaid diagram", () => {
			const model: ClassModel = {
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
			};

			const result = classModelToMermaid(model);

			assert.ok(result.includes("classDiagram"));
			assert.ok(result.includes("class Book"));
			assert.ok(result.includes("class Library"));
			assert.ok(result.includes("Library *-- Book"));
		});

		it("should handle empty model", () => {
			const model: ClassModel = {};
			const result = classModelToMermaid(model);
			assert.ok(result.includes("classDiagram"));
		});

		it("should support options parameter", () => {
			const model: ClassModel = {
				nodes: {
					UserAccount: {},
					JSONError: {},
				},
			};

			const result = classModelToMermaid(model, { autoClassLabels: true });

			assert.ok(result.includes('class UserAccount["user account"]'));
			assert.ok(result.includes('class JSONError["JSON error"]'));
		});

		it("should support options in yamlToMermaid", () => {
			const yaml = `
nodes:
  UserAccount: {}
  JSONError: {}
`;

			const result = classModelYamlToMermaid(yaml, { autoClassLabels: true });

			assert.ok(result.includes('class UserAccount["user account"]'));
			assert.ok(result.includes('class JSONError["JSON error"]'));
		});

		it("should support options in jsonToMermaid", () => {
			const json = JSON.stringify({
				nodes: {
					UserAccount: {},
					JSONError: {},
				},
			});

			const result = classModelJsonToMermaid(json, { autoClassLabels: true });

			assert.ok(result.includes('class UserAccount["user account"]'));
			assert.ok(result.includes('class JSONError["JSON error"]'));
		});
	});
});
