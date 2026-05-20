import {
	LinkPreset,
	type NavBarConfig,
	type NavBarSearchConfig,
	NavBarSearchMethod,
} from "../types/config";
import { siteConfig } from "./siteConfig";

const getDynamicNavBarConfig = (): NavBarConfig => {
	const links = [
		LinkPreset.Home,
		LinkPreset.Archive,
		...(siteConfig.pages.onlyabout ? [LinkPreset.About] : []),
	];

	return { links } as NavBarConfig;
};

export const navBarSearchConfig: NavBarSearchConfig = {
	method: NavBarSearchMethod.PageFind,
	meiliSearchConfig: {
		INDEX_NAME: "posts",
		CONTENT_DIR: "src/content/posts",
		MEILI_HOST: "http://localhost:7700",
		PUBLIC_MEILI_HOST: "http://localhost:7700",
		PUBLIC_MEILI_SEARCH_KEY:
			"41134b15079da66ca545375edbea848a9b7173dff13be2028318fefa41ae8f2b",
	},
};

export const navBarConfig: NavBarConfig = getDynamicNavBarConfig();
