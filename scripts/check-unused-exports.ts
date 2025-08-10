import { matchesGlob } from "node:path";
import { analyzeTsConfig } from "ts-unused-exports";

const cwd = process.cwd();
const ignoreFilePatterns = ["**/src/index.ts", "**/scripts/*"];

function normalizePath(path: string): string {
	let result = path;

	if (path.startsWith(cwd)) {
		result = path.slice(cwd.length + 1); // +1 to remove the slash after the cwd
	}
	return result;
}

function shouldCheck(path: string): boolean {
	for (const pattern of ignoreFilePatterns) {
		if (matchesGlob(path, pattern)) {
			return false;
		}
	}
	return true;
}

function main() {
	const { unusedExports } = analyzeTsConfig("./tsconfig.json");
	let exitCode = 0;

	const unusedExportEntries = [];
	for (const entry of Object.entries(unusedExports)) {
		const [filePath, exports] = entry;
		if (shouldCheck(filePath) && exports.length > 0) {
			unusedExportEntries.push(entry);
		}
	}

	if (unusedExportEntries.length === 0) {
		console.log("✅ No unused exports found.");
	} else {
		console.warn("⚠️  Found unused exports");
		console.group();
		exitCode = 1;
		for (const [filePath, exports] of unusedExportEntries)
			for (const exp of exports) {
				console.warn(normalizePath(filePath), "-", exp.exportName);
			}
		console.groupEnd();
		const msg = [
			"",
			"The modules above export symbols that are not imported anywhere.",
			"Consider removing the exports (or check if they were intended to be used elsewhere).",
		].join("\n");
		console.warn(msg);
	}

	return exitCode;
}

process.exit(main());
