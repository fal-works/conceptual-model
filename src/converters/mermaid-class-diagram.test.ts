import assert from "node:assert";
import { describe, it } from "node:test";
import type { ClassModel } from "../models/class-model/index.ts";
import { convertToMermaidClassDiagram } from "./mermaid-class-diagram.ts";

function createMinimalModel(): ClassModel {
	return {};
}

function createModelWithNodes(): ClassModel {
	return {
		nodes: {
			ClassA: {
				label: "Class A",
			},
			ClassB: {
				label: "Class B",
				attributes: ["field1", "field2"],
			},
		},
	};
}

function createModelWithEdges(): ClassModel {
	return {
		nodes: {
			Parent: { label: "Parent" },
			Child: { label: "Child" },
		},
		edges: [
			{
				source: "Parent",
				target: "Child",
				relation: "is-composed-of",
			},
		],
	};
}

describe("convertToMermaidClassDiagram", () => {
	describe("basic structure", () => {
		it("should generate minimal diagram", () => {
			const model = createMinimalModel();
			const result = convertToMermaidClassDiagram(model);

			assert.strictEqual(result, "classDiagram");
		});

		it("should include direction when specified", () => {
			const model: ClassModel = {
				...createMinimalModel(),
				layout: {
					direction: "LR",
				},
			};
			const result = convertToMermaidClassDiagram(model);

			assert.ok(result.includes("direction LR"));
		});

		it("should include title when specified", () => {
			const model: ClassModel = {
				...createMinimalModel(),
				title: "Test Diagram",
			};
			const result = convertToMermaidClassDiagram(model);

			assert.ok(result.includes("title Test Diagram"));
		});
	});

	describe("nodes", () => {
		it("should generate class without attributes", () => {
			const model = createModelWithNodes();
			const result = convertToMermaidClassDiagram(model);

			assert.ok(result.includes('class ClassA["Class A"]'));
		});

		it("should generate class with attributes", () => {
			const model = createModelWithNodes();
			const result = convertToMermaidClassDiagram(model);

			assert.ok(result.includes('class ClassB["Class B"] {'));
			assert.ok(result.includes("field1"));
			assert.ok(result.includes("field2"));
		});

		it("should use node key when label is missing", () => {
			const model: ClassModel = {
				nodes: {
					SimpleClass: {},
				},
			};
			const result = convertToMermaidClassDiagram(model);

			assert.ok(result.includes("class SimpleClass"));
		});

		it("should escape special characters in node names", () => {
			const model: ClassModel = {
				nodes: {
					"Class(With)Parens": {
						label: "Test Class",
					},
				},
			};
			const result = convertToMermaidClassDiagram(model);

			assert.ok(result.includes("class Class_With_Parens"));
		});

		it("should handle line breaks in labels", () => {
			const model: ClassModel = {
				nodes: {
					MultiLine: {
						label: "Multi\nLine",
					},
				},
			};
			const result = convertToMermaidClassDiagram(model);

			assert.ok(result.includes("Multi<br>Line"));
		});
	});

	describe("edges", () => {
		it("should generate edge-only model", () => {
			const model: ClassModel = {
				edges: [
					{
						source: "Library",
						target: "Book",
						relation: "is-composed-of",
					},
				],
			};
			const result = convertToMermaidClassDiagram(model);

			assert.ok(result.includes("Library *-- Book"));
			assert.strictEqual(result, "classDiagram\n    Library *-- Book");
		});

		it("should generate composition relationship", () => {
			const model = createModelWithEdges();
			const result = convertToMermaidClassDiagram(model);

			assert.ok(result.includes("Parent *-- Child"));
		});

		it("should generate aggregation relationship", () => {
			const model: ClassModel = {
				...createModelWithEdges(),
				edges: [
					{
						source: "Parent",
						target: "Child",
						relation: "aggregates",
					},
				],
			};
			const result = convertToMermaidClassDiagram(model);

			assert.ok(result.includes("Parent o-- Child"));
		});

		it("should generate inheritance relationship", () => {
			const model: ClassModel = {
				...createModelWithEdges(),
				edges: [
					{
						source: "Child",
						target: "Parent",
						relation: "is-a",
					},
				],
			};
			const result = convertToMermaidClassDiagram(model);

			assert.ok(result.includes("Child --|> Parent"));
		});

		it("should generate refers-to relationship", () => {
			const model: ClassModel = {
				...createModelWithEdges(),
				edges: [
					{
						source: "ClassA",
						target: "ClassB",
						relation: "refers-to",
					},
				],
			};
			const result = convertToMermaidClassDiagram(model);

			assert.ok(result.includes("ClassA --> ClassB"));
		});

		it("should generate to relationship", () => {
			const model: ClassModel = {
				...createModelWithEdges(),
				edges: [
					{
						source: "ClassA",
						target: "ClassB",
						relation: "to",
					},
				],
			};
			const result = convertToMermaidClassDiagram(model);

			assert.ok(result.includes("ClassA --> ClassB"));
		});

		it("should generate with relationship", () => {
			const model: ClassModel = {
				...createModelWithEdges(),
				edges: [
					{
						source: "ClassA",
						target: "ClassB",
						relation: "with",
					},
				],
			};
			const result = convertToMermaidClassDiagram(model);

			assert.ok(result.includes("ClassA -- ClassB"));
		});

		it("should handle edge without relation (defaults to undirected)", () => {
			const model: ClassModel = {
				...createModelWithEdges(),
				edges: [
					{
						source: "ClassA",
						target: "ClassB",
					},
				],
			};
			const result = convertToMermaidClassDiagram(model);

			assert.ok(result.includes("ClassA -- ClassB"));
		});

		it("should include edge labels", () => {
			const model: ClassModel = {
				...createModelWithEdges(),
				edges: [
					{
						source: "ClassA",
						target: "ClassB",
						relation: "refers-to",
						label: "custom label",
					},
				],
			};
			const result = convertToMermaidClassDiagram(model);

			assert.ok(result.includes("ClassA --> ClassB : custom label"));
		});

		it("should omit edge labels when not specified", () => {
			const model: ClassModel = {
				...createModelWithEdges(),
				edges: [
					{
						source: "ClassA",
						target: "ClassB",
						relation: "aggregates",
					},
				],
			};
			const result = convertToMermaidClassDiagram(model);

			assert.ok(result.includes("ClassA o-- ClassB"));
			assert.ok(!result.includes(":"));
		});

		it("should include bidirectional multiplicity when specified", () => {
			const model: ClassModel = {
				...createModelWithEdges(),
				edges: [
					{
						source: "Parent",
						target: "Child",
						relation: "is-composed-of",
						multiplicity: "1 -> 0..*",
					},
				],
			};
			const result = convertToMermaidClassDiagram(model);

			assert.ok(result.includes('Parent "1" *-- "0..*" Child'));
		});

		it("should include target-only multiplicity when specified", () => {
			const model: ClassModel = {
				...createModelWithEdges(),
				edges: [
					{
						source: "Department",
						target: "Employee",
						relation: "aggregates",
						multiplicity: "1..*",
					},
				],
			};
			const result = convertToMermaidClassDiagram(model);

			assert.ok(result.includes('Department o-- "1..*" Employee'));
		});
	});

	describe("complete diagram", () => {
		it("should generate comprehensive diagram", () => {
			const model: ClassModel = {
				title: "Complete Example",
				layout: {
					direction: "TB",
				},
				nodes: {
					Library: { label: "Library" },
					Book: {
						label: "Book",
						attributes: ["isbn", "title"],
					},
				},
				edges: [
					{
						source: "Library",
						target: "Book",
						relation: "is-composed-of",
						multiplicity: "0..*",
					},
				],
			};

			const result = convertToMermaidClassDiagram(model);

			assert.ok(result.includes("classDiagram"));
			assert.ok(result.includes("direction TB"));
			assert.ok(result.includes("title Complete Example"));
			assert.ok(result.includes('class Library["Library"]'));
			assert.ok(result.includes('class Book["Book"] {'));
			assert.ok(result.includes("isbn"));
			assert.ok(result.includes("title"));
			assert.ok(result.includes('Library *-- "0..*" Book'));
		});
	});
});
