import assert from "node:assert";
import { describe, it } from "node:test";
import { createValidator, formatValidationErrors, validateData } from "./validation.ts";

describe("validateData", () => {
	const testSchema = {
		type: "object",
		properties: {
			id: { type: "number" },
		},
		required: ["id"],
		additionalProperties: false,
	} as const;

	it("should validate using the default validator", () => {
		const validData = { id: 1 };
		const result = validateData(testSchema, validData);

		assert.strictEqual(result.valid, true);
		assert.deepStrictEqual(result.data, validData);
	});

	it("should return error for invalid data", () => {
		const invalidData = { id: "not-a-number" };
		const result = validateData(testSchema, invalidData);

		assert.strictEqual(result.valid, false);
		assert.ok(Array.isArray(result.errors));
	});
});

describe("createValidator", () => {
	const testSchema = {
		type: "object",
		properties: {
			value: { type: "string" },
		},
		required: ["value"],
		additionalProperties: false,
	} as const;

	it("should create a reusable validation function", () => {
		const validate = createValidator(testSchema);

		const validResult = validate({ value: "test" });
		assert.strictEqual(validResult.valid, true);
		assert.deepStrictEqual(validResult.data, { value: "test" });

		const invalidResult = validate({ value: 123 });
		assert.strictEqual(invalidResult.valid, false);
		assert.ok(Array.isArray(invalidResult.errors));
	});

	it("should use strict validation settings", () => {
		const validate = createValidator(testSchema);

		const result = validate({ value: 123, extra: "field" });
		assert.strictEqual(result.valid, false);
		assert.ok(Array.isArray(result.errors));
		// Should have multiple errors due to allErrors: true
		assert.ok(result.errors.length > 0);
	});

	it("should be efficient for multiple validations", () => {
		const validate = createValidator(testSchema);

		// Multiple calls should work with the same validator function
		assert.strictEqual(validate({ value: "test1" }).valid, true);
		assert.strictEqual(validate({ value: "test2" }).valid, true);
		assert.strictEqual(validate({ wrong: "field" }).valid, false);
	});
});

describe("formatValidationErrors", () => {
	it("should format errors into readable string", () => {
		const errors = [
			{ instancePath: "/name", message: "is required" },
			{ instancePath: "/age", message: "must be number" },
		] as any;

		const result = formatValidationErrors(errors);
		assert.strictEqual(result, "/name: is required, /age: must be number");
	});

	it("should handle empty errors array", () => {
		const result = formatValidationErrors([]);
		assert.strictEqual(result, "Unknown validation error");
	});

	it("should handle errors without instancePath", () => {
		const errors = [{ instancePath: "", message: "invalid format" }] as any;

		const result = formatValidationErrors(errors);
		assert.strictEqual(result, ": invalid format");
	});
});
