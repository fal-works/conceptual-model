import assert from "node:assert";
import { describe, it } from "node:test";
import { schema } from "./index.ts";

describe("models/class-model", () => {
	describe("structure", () => {
		// Only check the top-level structure here

		it("should export valid JSON schema (draft-07) object", () => {
			assert.ok(typeof schema === "object");
			assert.ok(schema !== null);
			assert.strictEqual(schema.$schema, "http://json-schema.org/draft-07/schema#");
		});
	});
});
