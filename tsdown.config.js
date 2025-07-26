import { defineConfig } from "tsdown";

/**
 * @type {import("tsdown").UserConfig}
 */
const commonConfig = {
	format: "esm",
	dts: false,
};

export default defineConfig([
	{
		...commonConfig,
		entry: { index: "src/index.ts" },
		outDir: "dist",
		sourcemap: true,
		platform: "neutral",
		target: ["es2022"],
	},
	{
		...commonConfig,
		entry: { bin: "src/bin.ts" },
		outDir: "dist",
		platform: "node",
		target: ["node22", "es2022"],
		external: ["./index.js"],
		banner: {
			js: "#!/usr/bin/env node",
		},
	},
]);
