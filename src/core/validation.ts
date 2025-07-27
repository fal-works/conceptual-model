import Ajv, { type ErrorObject, type JSONSchemaType, type ValidateFunction } from "ajv";

export type ValidationResult<T> =
	| { valid: true; data: T; errors?: undefined }
	| { valid: false; data?: undefined; errors: ErrorObject[] };

const ajv = new Ajv({ strict: true, allErrors: true });

/**
 * Compiles a JSON schema into a validation function.
 */
function compileSchema<T>(schema: JSONSchemaType<T> | object): ValidateFunction {
	return ajv.compile(schema);
}

/**
 * Validates data against a pre-compiled validation function.
 */
function runValidation<T>(validateFn: ValidateFunction, data: unknown): ValidationResult<T> {
	const valid = validateFn(data);

	if (valid) {
		return {
			valid: true,
			data: data as T,
		};
	}

	return {
		valid: false,
		errors: validateFn.errors || [],
	};
}

/**
 * Validates data against a JSON schema.
 * This is the main validation function for one-off validations.
 */
export function validateData<T>(
	schema: JSONSchemaType<T> | object,
	data: unknown,
): ValidationResult<T> {
	const validateFn = compileSchema(schema);
	return runValidation(validateFn, data);
}

/**
 * Creates a curried validation function for reuse with the same schema.
 * Useful when validating multiple data objects against the same schema.
 */
export function createValidator<T>(
	schema: JSONSchemaType<T> | object,
): (data: unknown) => ValidationResult<T> {
	const validateFn = compileSchema(schema);

	return (data: unknown) => runValidation<T>(validateFn, data);
}

/**
 * Formats validation errors into a human-readable string.
 */
export function formatValidationErrors(errors: ErrorObject[]): string {
	return (
		errors.map((err) => `${err.instancePath}: ${err.message}`).join(", ") ||
		"Unknown validation error"
	);
}
