import assert from "node:assert";
import { describe, it } from "node:test";
import { type ClassModel, classModelExporters, classModelImporters } from "./class-model.ts";

describe("class-model", () => {
	describe("importers and exporters", () => {
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
			const model = classModelImporters.yaml(yaml);
			const result = classModelExporters.mermaid(model);

			assert.match(result, /classDiagram/);
			assert.match(result, /class Book/);
			assert.match(result, /class Library/);
			assert.match(result, /Library \*-- Book/);
		});

		it("should handle auto-class-labels option", () => {
			const yaml = `
nodes:
  UserAccount:
    attributes:
      - username
`;
			const model = classModelImporters.yaml(yaml);
			const result = classModelExporters.mermaid(model, { autoClassLabels: true });

			assert.match(result, /UserAccount\["user account"\]/);
		});

		it("should convert valid JSON to Mermaid diagram", () => {
			const json = JSON.stringify({
				nodes: {
					Person: {
						label: "Person",
						attributes: ["name", "age"],
					},
					Company: {
						label: "Company",
					},
				},
				edges: [
					{
						source: "Person",
						target: "Company",
						relation: "refers-to",
						label: "works for",
					},
				],
			});

			const model = classModelImporters.json(json);
			const result = classModelExporters.mermaid(model);

			assert.match(result, /classDiagram/);
			assert.match(result, /class Person/);
			assert.match(result, /class Company/);
			assert.match(result, /Person --> Company : works for/);
		});

		it("should handle validation errors gracefully", () => {
			const invalidYaml = `
nodes: "should be an object"
`;
			assert.throws(() => classModelImporters.yaml(invalidYaml), /validation failed/i);
		});

		it("should validate JSON models", () => {
			const invalidJson = JSON.stringify({
				nodes: "should be an object",
			});

			assert.throws(() => classModelImporters.json(invalidJson), /validation failed/i);
		});
	});

	describe("YAML importer", () => {
		it("should parse and validate valid YAML", () => {
			const yaml = `
nodes:
  TestClass:
    label: Test Class
    attributes:
      - attribute1
`;
			const model = classModelImporters.yaml(yaml);
			assert.equal(model.nodes?.TestClass?.label, "Test Class");
			assert.deepEqual(model.nodes?.TestClass?.attributes, ["attribute1"]);
		});

		it("should throw on invalid YAML syntax", () => {
			const invalidYaml = `
nodes:
  - this is: invalid
  yaml syntax
`;
			assert.throws(() => classModelImporters.yaml(invalidYaml));
		});
	});

	describe("JSON importer", () => {
		it("should parse and validate valid JSON", () => {
			const model: ClassModel = {
				nodes: {
					TestClass: {
						label: "Test Class",
						attributes: ["attribute1"],
					},
				},
			};
			const json = JSON.stringify(model);
			const parsed = classModelImporters.json(json);
			assert.deepEqual(parsed, model);
		});

		it("should throw on invalid JSON syntax", () => {
			const invalidJson = "{ invalid json }";
			assert.throws(() => classModelImporters.json(invalidJson));
		});
	});

	describe("Mermaid exporter", () => {
		it("should generate correct Mermaid syntax for relationships", () => {
			const model: ClassModel = {
				nodes: {
					Parent: {},
					Child: {},
				},
				edges: [
					{
						source: "Parent",
						target: "Child",
						relation: "is-a",
					},
				],
			};

			const result = classModelExporters.mermaid(model);
			assert.match(result, /Parent --|> Child/);
		});

		it("should handle multiplicity", () => {
			const model: ClassModel = {
				nodes: {
					Library: {},
					Book: {},
				},
				edges: [
					{
						source: "Library",
						target: "Book",
						multiplicity: "1->0..*",
					},
				],
			};

			const result = classModelExporters.mermaid(model);
			assert.match(result, /Library "1" -- "0..\*" Book/);
		});
	});
});
