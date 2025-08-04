import { deepStrictEqual, throws } from "node:assert";
import { describe, it } from "node:test";
import type { ClassModel } from "../models/class-model/index.ts";
import { convertModel, createModelValidator, parseFileContent, validateModel } from "./pipeline.ts";

const validYaml = `
nodes:
  User:
    attributes:
      - "id: string"
      - "name: string"
edges: []
`;

const validJson = JSON.stringify({
	nodes: {
		User: {
			attributes: ["id: string", "name: string"],
		},
	},
	edges: [],
});

const invalidData = JSON.stringify({
	nodes: {
		User: {
			wrongField: "value",
		},
	},
});

describe("pipeline", () => {
	describe("parseFileContent", () => {
		it("should parse YAML", () => {
			const result = parseFileContent(validYaml, "yaml");
			deepStrictEqual(typeof result, "object");
			deepStrictEqual((result as any).nodes.User.attributes.length, 2);
		});

		it("should parse JSON", () => {
			const result = parseFileContent(validJson, "json");
			deepStrictEqual(typeof result, "object");
			deepStrictEqual((result as any).nodes.User.attributes.length, 2);
		});

		it("should throw on invalid YAML", () => {
			throws(() => parseFileContent("{ invalid yaml", "yaml"));
		});

		it("should throw on invalid JSON", () => {
			throws(() => parseFileContent("{ invalid json", "json"));
		});
	});

	describe("validateModel", () => {
		it("should validate valid class model data", () => {
			const data = JSON.parse(validJson);
			const result = validateModel(data, "class-model");
			deepStrictEqual(result.nodes?.User?.attributes?.length, 2);
		});

		it("should throw on invalid data", () => {
			const data = JSON.parse(invalidData);
			throws(() => validateModel(data, "class-model"), /Validation failed/);
		});

		it("should throw on unknown model type", () => {
			throws(() => validateModel({}, "unknown-model" as never), /No schema found for model type/);
		});
	});

	describe("convertModel", () => {
		it("should convert class model to mermaid", () => {
			const model: ClassModel = {
				nodes: {
					User: {
						attributes: ["id: string", "name: string"],
					},
				},
				edges: [],
			};
			const result = convertModel(model, "class-model", "mermaid");
			deepStrictEqual(result.includes("classDiagram"), true);
			deepStrictEqual(result.includes("class User"), true);
		});
	});

	describe("createModelValidator", () => {
		it("should create a reusable validator", () => {
			const validator = createModelValidator("class-model");
			const data = JSON.parse(validJson);
			const result = validator(data);
			deepStrictEqual(result.valid, true);
			deepStrictEqual(result.data?.nodes?.User?.attributes?.length, 2);
		});

		it("should throw for unknown model type", () => {
			throws(
				() => createModelValidator("unknown-model" as never),
				/No schema found for model type/,
			);
		});
	});
});
