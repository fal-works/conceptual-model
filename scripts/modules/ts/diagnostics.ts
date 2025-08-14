import ts from "typescript";

export function formatDiagnostics(diags: readonly ts.Diagnostic[]): string {
	const host: ts.FormatDiagnosticsHost = {
		getCanonicalFileName: (f) => f,
		getCurrentDirectory: ts.sys.getCurrentDirectory,
		getNewLine: () => "\n",
	};
	return ts.formatDiagnosticsWithColorAndContext(diags, host);
}
