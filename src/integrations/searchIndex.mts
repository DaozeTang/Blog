import { execSync } from "node:child_process";
import type { AstroIntegration } from "astro";

export default function searchIndexer() {
	const data: AstroIntegration = {
		name: "search-indexer",
		hooks: {
			"astro:build:done": async () => {
				console.log(`${"=".repeat(10)}Running Pagefind Indexer...${"=".repeat(10)}`);
				try {
					execSync("pagefind --site dist", {
						encoding: "utf-8",
						stdio: "inherit",
					});
				} catch (error) {
					console.error("Pagefind Index Failed:", error.message);
				}
				console.log(`${"=".repeat(10)}Search Indexer Done.${"=".repeat(10)}`);
			},
		},
	};
	return data;
}
