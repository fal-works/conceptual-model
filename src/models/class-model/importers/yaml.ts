/**
 * YAML import functionality for class models.
 */
import { parseYaml } from "../../../core/parsers.ts";
import { formatValidationErrors, validateData } from "../../../core/validation.ts";
import { schema } from "../schema-object.ts";
import type { ClassModel } from "../types.ts";

export function importYaml(yamlString: string): ClassModel {
	const parsed = parseYaml(yamlString);
	const result = validateData<ClassModel>(schema, parsed);

	if (!result.valid) {
		throw new Error(`Class model validation failed:\n${formatValidationErrors(result.errors)}`);
	}

	return result.data;
}
