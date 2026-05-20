import type { SiteConfig } from "@/types/config";
import { fontConfig } from "./fontConfig";

const SITE_LANG = "zh_CN";

export const siteConfig: SiteConfig = {
	title: "Blog - Daoze Tang",
	subtitle: " ",
	site_url: "https://blog.dztang.net",
	description:
		"Blog - Daoze Tang",
	keywords: [
		"Blog",
		"Deep Learning",
		"Artificial Intelligence",
		"Computer Vision",
		"Object Detection",
	],

	lang: SITE_LANG,

	themeColor: {
		hue: 255,
		fixed: false,
		defaultMode: "system",
	},

	favicon: [
		{
			src: "/assets/images/favicon.ico",
			theme: "light",
			sizes: "32x32",
		},
	],

	navbarLogo: {
		mode: false,
		type: "image",
		value: "/assets/images/blankspace.png",
		alt: "",
	},
	navbarTitle: "Daoze Tang",
	navbarWidthFull: false,

	siteStartDate: "2022-09-01",

	bangumi: {
		userId: "",
	},

	showLastModified: true,

	generateOgImages: true,

	pages: {
		onlyabout: true,
		links: false,
		friends: false,
		sponsor: false,
		guestbook: false,
		bangumi: false,
	},

	postListLayout: {
		defaultMode: "list",
		allowSwitch: true,
	},

	pagination: {
		postsPerPage: 10,
	},

	backgroundWallpaper: {
		mode: "none",
		switchable: false,

		src: {
			desktop: "/assets/images/wall.png",
			mobile: "/assets/images/wallm.png",
		},

		banner: {
			position: "0% 20%",

			homeText: {
				enable: false,
				title: "Lovely firefly!",
				subtitle: [
					"In Reddened Chrysalis, I Once Rest",
					"From Shattered Sky, I Free Fall",
					"Amidst Silenced Stars, I Deep Sleep",
					"Upon Lighted Fyrefly, I Soon Gaze",
					"From Undreamt Night, I Thence Shine",
					"In Finalized Morrow, I Full Bloom",
				],
				typewriter: {
					enable: false,
					speed: 100,
					deleteSpeed: 50,
					pauseTime: 2000,
				},
			},
			credit: {
				enable: {
					desktop: true,
					mobile: true,
				},
				text: {
					desktop: "Photo by Daoze Tang, Jul 2021.",
					mobile: "Photo by Daoze Tang, Sep 2021.",
				},
				url: {
					desktop: "https://dztang.net/",
					mobile: "https://dztang.net/",
				},
			},
			navbar: {
				transparentMode: "semifull",
			},
			waves: {
				enable: {
					desktop: true,
					mobile: true,
				},
				performance: {
					quality: "high",
					hardwareAcceleration: true,
				},
			},
		},

		overlay: {
			zIndex: -1,
			opacity: 0.8,
			blur: 1,
		},
	},

	font: fontConfig,
};
