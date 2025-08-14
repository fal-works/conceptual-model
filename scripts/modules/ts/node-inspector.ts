import ts from "typescript";

export interface Inspector<TResult> {
	nodeInspectorFactory: (srcFile: ts.SourceFile) => NodeInspector<TResult>;
	resultsHandler: ResultsHandler<TResult>;
}

export type NodeInspector<TResult> = (
	node: ts.Node,
	recentResult: TResult | null,
) => TResult | null | undefined;

export type ResultsHandler<TResult> = (
	resultPerFile: FileInspectionResult<TResult>[],
) => InspectionStatus;

export interface FileInspectionResult<TResult> {
	srcFile: ts.SourceFile;
	result: TResult;
}

export type InspectionStatus = "error" | "warn" | "success";

/**
 * Inspects the given source file using the provided inspectors.
 *
 * After calling this function, see the `result` of each inspector for the findings.
 */
export async function inspect<T>(
	inspectors: Inspector<T>[],
	srcFiles: Promise<ts.SourceFile>[],
): Promise<InspectionStatus> {
	const inspectorCount = inspectors.length;

	const settled = await Promise.allSettled(
		srcFiles.map(async (srcFilePromise) => {
			const srcFile = await srcFilePromise;
			const nodeInspectors = inspectors.map((inspector) => inspector.nodeInspectorFactory(srcFile));
			const resultPerInspector: (T | null)[] = new Array(inspectorCount).fill(null);

			const inspectNode = (node: ts.Node) => {
				for (let i = 0; i < inspectorCount; ++i) {
					const lastResult = resultPerInspector[i];
					const ret = nodeInspectors[i](node, lastResult);
					if (ret !== undefined) resultPerInspector[i] = ret;
				}
				ts.forEachChild(node, inspectNode);
			};

			inspectNode(srcFile);

			return { srcFile, resultPerInspector };
		}),
	);

	const resultsPerInspector: FileInspectionResult<T>[][] = Array.from(
		{ length: inspectorCount },
		() => [],
	);
	let status: InspectionStatus = "success";

	for (const processedFile of settled) {
		if (processedFile.status === "fulfilled") {
			for (let i = 0; i < inspectorCount; ++i) {
				const { srcFile, resultPerInspector } = processedFile.value;
				const result = resultPerInspector[i];
				if (result !== null) resultsPerInspector[i].push({ srcFile, result });
			}
		} else {
			console.error("Error occurred during source file inspection:");
			console.group();
			console.error(processedFile.reason);
			console.groupEnd();
			console.error(); // empty line
			status = "error";
		}
	}

	for (let i = 0; i < inspectorCount; ++i) {
		const resultPerFile = resultsPerInspector[i];
		if (inspectors[i].resultsHandler(resultPerFile) === "error") {
			status = "error";
		}
	}

	return status;
}
