import ts from "typescript";

export function parseAsTsFile(filename: string, code: string): ts.SourceFile {
	return ts.createSourceFile(
		filename,
		code,
		ts.ScriptTarget.Latest,
		/*setParentNodes*/ true,
		ts.ScriptKind.TS,
	);
}
