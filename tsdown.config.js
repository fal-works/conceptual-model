import { defineConfig } from "tsdown";

/**
 * @type {import("tsdown").UserConfig}
 */
const commonConfig = {
	format: "esm",
};

export default defineConfig([
	{
		...commonConfig,
		entry: { index: "src/index.ts" },
		outDir: "dist",
		sourcemap: true,
		dts: true,
		platform: "neutral",
		target: ["es2022"],
		external: ["ajv", "cac", "yaml"],
	},
	{
		...commonConfig,
		entry: { bin: "src/bin.ts" },
		outDir: "dist",
		dts: false,
		minify: true,
		platform: "node",
		target: ["node22", "es2022"],
		external: ["ajv", "cac", "yaml"],
	},
]);
