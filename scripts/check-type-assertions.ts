#!/usr/bin/env node

/**
 * Detects TypeScript `as` assertions (excluding `as const`).
 * Automatically reads `tsconfig.json` at the current directory to find all source files.
 *
 * Usage:
 *   node scripts/check-type-assertions.ts
 */

import { readFile } from "node:fs/promises";
import { dirname } from "node:path";
import ts from "typescript";

type Finding = {
	file: string;
	line: number; // 1-based
	snippet: string;
};

const IGNORE_COMMENT = "UNAVOIDABLE_AS";

const friendlyMessage = () =>
	`
💡 TIPS:
Review these type assertions carefully. In most cases, \`as\` should be your last resort.
- **Prefer assignability over assertion:**
  If a value already matches a target type,
  just declare it with that type or pass it to a function that accepts that type.
- **Avoid \`as\` to work around design issues:**
  Needing assertions often means the types aren’t aligned.
  Consider redesigning the types or the data flow so the compiler can infer types safely.

If you truly must keep \`as\` e.g. this is an isolated utility function
or a third-party library integration, add a comment: /* UNAVOIDABLE_AS */
But be aware that this is a highly exceptional case.
`.trim();

function formatDiags(diags: readonly ts.Diagnostic[]): string {
	const host: ts.FormatDiagnosticsHost = {
		getCanonicalFileName: (f) => f,
		getCurrentDirectory: ts.sys.getCurrentDirectory,
		getNewLine: () => "\n",
	};
	return ts.formatDiagnosticsWithColorAndContext(diags, host);
}

function getFilesFromTsconfig(tsconfigPath: string): string[] {
	const configFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
	if (configFile.error) {
		throw new Error(formatDiags([configFile.error]));
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

	return configParseResult.fileNames;
}

function isAsConst(asExpr: ts.AsExpression): boolean {
	const t = asExpr.type;
	return (
		ts.isTypeReferenceNode(t) &&
		ts.isIdentifier(t.typeName) &&
		t.typeName.text === "const" &&
		!t.typeArguments
	);
}

function hasUnavoidableAsComment(sf: ts.SourceFile, node: ts.Node): boolean {
	const text = sf.getFullText();

	// Check leading comments
	const leading = ts.getLeadingCommentRanges(text, node.getFullStart()) || [];
	for (const r of leading) {
		const comment = text.slice(r.pos, r.end);
		if (comment.includes(IGNORE_COMMENT)) return true;
	}

	// Check trailing comments
	const trailing = ts.getTrailingCommentRanges(text, node.end) || [];
	for (const r of trailing) {
		const comment = text.slice(r.pos, r.end);
		if (comment.includes(IGNORE_COMMENT)) return true;
	}

	return false;
}

function findAsAssertions(sf: ts.SourceFile): Finding[] {
	const out: Finding[] = [];

	const visit = (node: ts.Node) => {
		if (ts.isAsExpression(node) && !isAsConst(node) && !hasUnavoidableAsComment(sf, node)) {
			const { line } = sf.getLineAndCharacterOfPosition(node.getStart(sf, false));
			out.push({
				file: sf.fileName,
				line: line + 1,
				snippet: node.getText(sf),
			});
		}
		ts.forEachChild(node, visit);
	};

	visit(sf);
	return out;
}

function parseTsFile(filename: string, code: string): ts.SourceFile | null {
	let kind: ts.ScriptKind;

	if (filename.endsWith(".ts") && !filename.endsWith(".test.ts")) {
		kind = ts.ScriptKind.TS;
	} else {
		return null;
	}

	return ts.createSourceFile(filename, code, ts.ScriptTarget.Latest, /*setParentNodes*/ true, kind);
}

async function main() {
	const promises = getFilesFromTsconfig("tsconfig.json").map(async (path) => {
		const code = await readFile(path, "utf-8");
		const sf = parseTsFile(path, code);
		return sf != null ? findAsAssertions(sf) : [];
	});

	const arr = (await Promise.all(promises)).flat();
	if (arr.length > 0) {
		console.warn("Found suspicious type assertions:");
		for (const f of arr) {
			console.warn("⚠️ ", `${f.file}:${f.line}`, "-", `${f.snippet}`);
		}
		console.log(); // empty line
		console.warn(friendlyMessage());
	}
}

await main();
