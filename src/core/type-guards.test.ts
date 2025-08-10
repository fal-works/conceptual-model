import assert from "node:assert";
import { describe, it } from "node:test";
import { isValidValue } from "./type-guards.ts";

describe("type-guards", () => {
	describe("isValidValue", () => {
		it("should return true for valid values", () => {
			const validValues = new Set(["json", "yaml"] as const);
			assert.strictEqual(isValidValue(validValues, "json"), true);
			assert.strictEqual(isValidValue(validValues, "yaml"), true);
		});

		it("should return false for invalid values", () => {
			const validValues = new Set(["json", "yaml"] as const);
			assert.strictEqual(isValidValue(validValues, "xml"), false);
			assert.strictEqual(isValidValue(validValues, undefined), false);
			assert.strictEqual(isValidValue(validValues, null), false);
		});

		it("should work with numeric values", () => {
			const validValues = new Set([1, 2, 3] as const);
			assert.strictEqual(isValidValue(validValues, 2), true);
			assert.strictEqual(isValidValue(validValues, 5), false);
		});
	});
});
