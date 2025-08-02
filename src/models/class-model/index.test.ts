import assert from "node:assert";
import { describe, it } from "node:test";
import { classModelSchema } from "./index.ts";

describe("models/class-model", () => {
	describe("structure", () => {
		// Only check the top-level structure here

		it("should export valid JSON schema (draft-07) object", () => {
			assert.ok(typeof classModelSchema === "object");
			assert.ok(classModelSchema !== null);
			assert.strictEqual(classModelSchema.$schema, "http://json-schema.org/draft-07/schema#");
		});
	});
});
