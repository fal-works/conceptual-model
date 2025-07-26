import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import constants from "../constants.json" with { type: "json" };
import { convertYamlFileToJson } from "./y2j.ts";

const { schemaVersion } = constants;
const outSchemaDir = `docs/schema/v${schemaVersion}`;
mkdirSync(outSchemaDir, { recursive: true });

const schemaNames = ["class-model"];

for (const name of schemaNames) {
	const yamlFile = `schema/${name}.yaml`;
	const yamlContent = readFileSync(yamlFile, "utf-8");

	const updatedYamlContent = yamlContent.replace(
		/conceptual-model\/schema\/v([^/]+)\//g,
		(_match, oldVersion) => {
			if (oldVersion === schemaVersion) {
				console.log(`Processing schema version: v${schemaVersion}`);
			} else {
				console.log(`Updating YAML ${yamlFile}: v${oldVersion} → v${schemaVersion}`);
			}
			return `conceptual-model/schema/v${schemaVersion}/`;
		},
	);
	writeFileSync(yamlFile, updatedYamlContent, "utf-8");

	const jsonFile = `${outSchemaDir}/${name}.json`;
	convertYamlFileToJson(yamlFile, jsonFile);
}
