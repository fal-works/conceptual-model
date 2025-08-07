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

function createModelWithGroups(): ClassModel {
	return {
		nodes: {
			ClassA: { label: "Class A" },
			ClassB: { label: "Class B", attributes: ["field1"] },
			ClassC: { label: "Class C" },
			OrphanClass: { label: "Orphan" },
		},
		groups: {
			group1: {
				label: "Group 1",
				nodes: ["ClassA", "ClassB"],
			},
			group2: {
				label: "Group 2",
				nodes: ["ClassC"],
			},
		},
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

	describe("groups", () => {
		it("should generate namespaces for groups", () => {
			const model = createModelWithGroups();
			const result = convertToMermaidClassDiagram(model);

			assert.ok(result.includes("namespace Group 1 {"));
			assert.ok(result.includes("namespace Group 2 {"));
		});

		it("should place grouped nodes inside namespaces", () => {
			const model = createModelWithGroups();
			const result = convertToMermaidClassDiagram(model);

			// Check that grouped classes appear within namespaces
			assert.ok(result.includes('    class ClassA["Class A"]'));
			assert.ok(result.includes('    class ClassB["Class B"] {'));
			assert.ok(result.includes('    class ClassC["Class C"]'));
		});

		it("should place ungrouped nodes outside namespaces", () => {
			const model = createModelWithGroups();
			const result = convertToMermaidClassDiagram(model);

			// OrphanClass should appear outside any namespace
			assert.ok(result.includes('class OrphanClass["Orphan"]'));
			// Should not be inside a namespace block - check that it appears with correct indentation
			const lines = result.split("\n");
			const orphanLine = lines.find((line) => line.includes("class OrphanClass"));
			// Ungrouped nodes should have 4 spaces indentation (standard Mermaid indentation)
			assert.ok(orphanLine?.startsWith("    class OrphanClass"));
			// But should not be nested inside a namespace (no 8-space indentation)
			assert.ok(orphanLine && !orphanLine.startsWith("        "));
		});

		it("should use group key when label is missing", () => {
			const model: ClassModel = {
				nodes: {
					TestClass: { label: "Test" },
				},
				groups: {
					unlabeled_group: {
						nodes: ["TestClass"],
					},
				},
			};
			const result = convertToMermaidClassDiagram(model);

			assert.ok(result.includes("namespace unlabeled_group {"));
		});

		it("should handle empty groups", () => {
			const model: ClassModel = {
				nodes: {
					TestClass: { label: "Test" },
				},
				groups: {
					empty_group: {
						label: "Empty Group",
						nodes: [],
					},
					valid_group: {
						label: "Valid Group",
						nodes: ["TestClass"],
					},
				},
			};
			const result = convertToMermaidClassDiagram(model);

			// Empty group should not appear
			assert.ok(!result.includes("namespace Empty Group {"));
			// Valid group should appear
			assert.ok(result.includes("namespace Valid Group {"));
		});

		it("should handle groups with nonexistent nodes", () => {
			const model: ClassModel = {
				nodes: {
					ExistingClass: { label: "Existing" },
				},
				groups: {
					test_group: {
						label: "Test Group",
						nodes: ["ExistingClass", "NonexistentClass"],
					},
				},
			};
			const result = convertToMermaidClassDiagram(model);

			// Should process existing nodes normally
			assert.ok(result.includes("namespace Test Group {"));
			assert.ok(result.includes('    class ExistingClass["Existing"]'));
		});

		it("should throw error when node belongs to multiple groups", () => {
			const model: ClassModel = {
				nodes: {
					SharedClass: { label: "Shared" },
					OtherClass: { label: "Other" },
				},
				groups: {
					group1: {
						label: "Group 1",
						nodes: ["SharedClass"],
					},
					group2: {
						label: "Group 2",
						nodes: ["SharedClass", "OtherClass"],
					},
				},
			};

			assert.throws(
				() => convertToMermaidClassDiagram(model),
				/Node 'SharedClass' belongs to multiple groups/,
			);
		});

		it("should maintain proper namespace structure with attributes", () => {
			const model: ClassModel = {
				nodes: {
					ClassWithAttrs: {
						label: "Class With Attributes",
						attributes: ["attr1", "attr2"],
					},
				},
				groups: {
					test_group: {
						label: "Test Group",
						nodes: ["ClassWithAttrs"],
					},
				},
			};
			const result = convertToMermaidClassDiagram(model);

			assert.ok(result.includes("namespace Test Group {"));
			assert.ok(result.includes('    class ClassWithAttrs["Class With Attributes"] {'));
			assert.ok(result.includes("        attr1"));
			assert.ok(result.includes("        attr2"));
			assert.ok(result.includes("    }"));
			assert.ok(result.includes("}"));
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

		it("should generate comprehensive diagram with groups", () => {
			const model: ClassModel = {
				title: "Library Management System",
				layout: {
					direction: "TB",
				},
				nodes: {
					Library: { label: "Library" },
					Book: {
						label: "Book",
						attributes: ["isbn", "title", "author"],
					},
					User: { label: "User" },
					Loan: {
						label: "Loan",
						attributes: ["startDate", "dueDate"],
					},
					System: { label: "Management System" },
				},
				groups: {
					entities: {
						label: "Core Entities",
						nodes: ["Library", "Book", "User"],
					},
					transactions: {
						label: "Transactions",
						nodes: ["Loan"],
					},
				},
				edges: [
					{
						source: "Library",
						target: "Book",
						relation: "is-composed-of",
						multiplicity: "1 -> 0..*",
					},
					{
						source: "User",
						target: "Loan",
						relation: "refers-to",
						multiplicity: "1 -> 0..*",
					},
				],
			};

			const result = convertToMermaidClassDiagram(model);

			// Basic structure
			assert.ok(result.includes("classDiagram"));
			assert.ok(result.includes("direction TB"));
			assert.ok(result.includes("title Library Management System"));

			// Groups/namespaces
			assert.ok(result.includes("namespace Core Entities {"));
			assert.ok(result.includes("namespace Transactions {"));

			// Grouped nodes
			assert.ok(result.includes('    class Library["Library"]'));
			assert.ok(result.includes('    class Book["Book"] {'));
			assert.ok(result.includes('    class User["User"]'));
			assert.ok(result.includes('    class Loan["Loan"] {'));

			// Ungrouped node
			assert.ok(result.includes('class System["Management System"]'));

			// Relationships
			assert.ok(result.includes('Library "1" *-- "0..*" Book'));
			assert.ok(result.includes('User "1" --> "0..*" Loan'));
		});
	});
});
