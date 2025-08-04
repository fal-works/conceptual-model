import { deepStrictEqual } from "node:assert";
import { describe, it } from "node:test";
import type { ClassModel } from "../models/class-model/index.ts";
import { converters, getConverter } from "./index.ts";

const sampleClassModel: ClassModel = {
	nodes: {
		User: {
			attributes: ["id: string", "name: string"],
		},
	},
	edges: [],
};

describe("converters", () => {
	describe("registry", () => {
		it("should have class-model converters", () => {
			deepStrictEqual(typeof converters["class-model"].mermaid, "function");
		});
	});

	describe("getConverter", () => {
		it("should return converter for valid model-output combination", () => {
			const converter = getConverter("class-model", "mermaid");
			deepStrictEqual(typeof converter, "function");

			const result = converter(sampleClassModel);
			deepStrictEqual(typeof result, "string");
			deepStrictEqual(result.includes("classDiagram"), true);
		});

		// Note: Invalid combinations are now caught at compile time by TypeScript
		// No runtime errors are possible for type-safe calls
	});
});
