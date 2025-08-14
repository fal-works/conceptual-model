import { dirname } from "node:path";
import ts from "typescript";
import { formatDiagnostics } from "./diagnostics.ts";

export function parseTsconfig(tsconfigPath: string): ts.ParsedCommandLine {
	const configFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
	if (configFile.error) {
		throw new Error(formatDiagnostics([configFile.error]));
	}

	const configParseResult = ts.parseJsonConfigFileContent(
		configFile.config,
		ts.sys,
		dirname(tsconfigPath),
	);

	if (configParseResult.errors.length) {
		console.error(
			ts.formatDiagnosticsWithColorAndContext(configParseResult.errors, {
				getCanonicalFileName: (f) => f,
				getCurrentDirectory: ts.sys.getCurrentDirectory,
				getNewLine: () => "\n",
			}),
		);
	}

	return configParseResult;
}
