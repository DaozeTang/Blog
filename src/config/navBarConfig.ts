import {
	LinkPreset,
	type NavBarConfig,
	type NavBarLink,
	type NavBarSearchConfig,
	NavBarSearchMethod,
} from "../types/config";
import { siteConfig } from "./siteConfig";

const getDynamicNavBarConfig = (): NavBarConfig => {
	const links: (NavBarLink | LinkPreset)[] = [
		LinkPreset.Home,
		LinkPreset.Archive,
	];

	if (siteConfig.pages.links) {
		links.push({
			name: "链接",
			url: "/links/",
			icon: "material-symbols:link",
			children: [
				{
					name: "Homepage",
					url: "https://dztang.net/",
					external: true,
					icon: "fa6-solid:globe",
				},
				{
					name: "Email",
					url: "mailto:tdz@s.hrbcu.edu.cn",
					external: true,
					icon: "fa6-solid:envelope",
				},
				{
					name: "GitHub",
					url: "https://github.com/DaozeTang",
					external: true,
					icon: "fa6-brands:github",
				},
			],
		});
	}

	if (siteConfig.pages.friends) {
		links.push(LinkPreset.Friends);
	}

	if (siteConfig.pages.guestbook) {
		links.push(LinkPreset.Guestbook);
	}

	if (siteConfig.pages.onlyabout) {
		links.push(LinkPreset.About);
	} else {
		links.push({
			name: "关于",
			url: "/content/",
			icon: "material-symbols:info",
			children: [
				...(siteConfig.pages.sponsor ? [LinkPreset.Sponsor] : []),
				LinkPreset.About,
				...(siteConfig.pages.bangumi ? [LinkPreset.Bangumi] : []),
			],
		});
	}

	return { links } as NavBarConfig;
};

// PageFind | MeiliSearch
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
