import assert from "node:assert";
import { describe, it } from "node:test";
import type { Graph } from "../models/class-model/index.ts";
import { convertToMermaidClassDiagram } from "./mermaid-class-diagram.ts";

function createMinimalGraph(): Graph {
	return {
		nodes: {},
		edges: [],
	};
}

function createGraphWithNodes(): Graph {
	return {
		nodes: {
			ClassA: {
				label: "Class A",
			},
			ClassB: {
				label: "Class B",
				metadata: {
					attributes: ["field1", "field2"],
				},
			},
		},
		edges: [],
	};
}

function createGraphWithEdges(): Graph {
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
			const graph = createMinimalGraph();
			const result = convertToMermaidClassDiagram(graph);

			assert.strictEqual(result, "classDiagram");
		});

		it("should include direction when specified", () => {
			const graph: Graph = {
				...createMinimalGraph(),
				metadata: {
					layout: {
						direction: "LR",
					},
				},
			};
			const result = convertToMermaidClassDiagram(graph);

			assert.ok(result.includes("direction LR"));
		});

		it("should include title when specified", () => {
			const graph: Graph = {
				...createMinimalGraph(),
				label: "Test Diagram",
			};
			const result = convertToMermaidClassDiagram(graph);

			assert.ok(result.includes("title Test Diagram"));
		});
	});

	describe("nodes", () => {
		it("should generate class without attributes", () => {
			const graph = createGraphWithNodes();
			const result = convertToMermaidClassDiagram(graph);

			assert.ok(result.includes('class ClassA["Class A"]'));
		});

		it("should generate class with attributes", () => {
			const graph = createGraphWithNodes();
			const result = convertToMermaidClassDiagram(graph);

			assert.ok(result.includes('class ClassB["Class B"] {'));
			assert.ok(result.includes("field1"));
			assert.ok(result.includes("field2"));
		});

		it("should use node key when label is missing", () => {
			const graph: Graph = {
				nodes: {
					SimpleClass: {},
				},
				edges: [],
			};
			const result = convertToMermaidClassDiagram(graph);

			assert.ok(result.includes("class SimpleClass"));
		});

		it("should escape special characters in node names", () => {
			const graph: Graph = {
				nodes: {
					"Class(With)Parens": {
						label: "Test Class",
					},
				},
				edges: [],
			};
			const result = convertToMermaidClassDiagram(graph);

			assert.ok(result.includes("class Class_With_Parens"));
		});

		it("should handle line breaks in labels", () => {
			const graph: Graph = {
				nodes: {
					MultiLine: {
						label: "Multi\nLine",
					},
				},
				edges: [],
			};
			const result = convertToMermaidClassDiagram(graph);

			assert.ok(result.includes("Multi<br>Line"));
		});
	});

	describe("edges", () => {
		it("should generate composition relationship", () => {
			const graph = createGraphWithEdges();
			const result = convertToMermaidClassDiagram(graph);

			assert.ok(result.includes("Parent *-- Child"));
		});

		it("should generate aggregation relationship", () => {
			const graph: Graph = {
				...createGraphWithEdges(),
				edges: [
					{
						source: "Parent",
						target: "Child",
						relation: "aggregates",
					},
				],
			};
			const result = convertToMermaidClassDiagram(graph);

			assert.ok(result.includes("Parent o-- Child"));
		});

		it("should generate inheritance relationship", () => {
			const graph: Graph = {
				...createGraphWithEdges(),
				edges: [
					{
						source: "Child",
						target: "Parent",
						relation: "is-a",
					},
				],
			};
			const result = convertToMermaidClassDiagram(graph);

			assert.ok(result.includes("Child --|> Parent"));
		});

		it("should generate link relationship without label when none specified", () => {
			const graph: Graph = {
				...createGraphWithEdges(),
				edges: [
					{
						source: "ClassA",
						target: "ClassB",
						relation: "links-to",
					},
				],
			};
			const result = convertToMermaidClassDiagram(graph);

			assert.ok(result.includes("ClassA --> ClassB"));
			assert.ok(!result.includes("ClassA --> ClassB :"));
		});

		it("should generate link relationship with custom label", () => {
			const graph: Graph = {
				...createGraphWithEdges(),
				edges: [
					{
						source: "ClassA",
						target: "ClassB",
						relation: "links-to",
						label: "custom label",
					},
				],
			};
			const result = convertToMermaidClassDiagram(graph);

			assert.ok(result.includes("ClassA --> ClassB : custom label"));
		});

		it("should include multiplicity when specified", () => {
			const graph: Graph = {
				...createGraphWithEdges(),
				edges: [
					{
						source: "Parent",
						target: "Child",
						relation: "is-composed-of",
						metadata: {
							multiplicity: {
								source: "1",
								target: "0..*",
							},
						},
					},
				],
			};
			const result = convertToMermaidClassDiagram(graph);

			assert.ok(result.includes('Parent "1" *-- "0..*" Child'));
		});

		it("should handle edge without relation", () => {
			const graph: Graph = {
				...createGraphWithEdges(),
				edges: [
					{
						source: "ClassA",
						target: "ClassB",
					},
				],
			};
			const result = convertToMermaidClassDiagram(graph);

			assert.ok(result.includes("ClassA -- ClassB"));
		});
	});

	describe("complete diagram", () => {
		it("should generate comprehensive diagram", () => {
			const graph: Graph = {
				label: "Complete Example",
				metadata: {
					layout: {
						direction: "TB",
					},
				},
				nodes: {
					Library: { label: "Library" },
					Book: {
						label: "Book",
						metadata: {
							attributes: ["isbn", "title"],
						},
					},
				},
				edges: [
					{
						source: "Library",
						target: "Book",
						relation: "is-composed-of",
						metadata: {
							multiplicity: {
								target: "0..*",
							},
						},
					},
				],
			};

			const result = convertToMermaidClassDiagram(graph);

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
