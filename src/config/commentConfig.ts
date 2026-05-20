import type { CommentConfig } from "../types/config";

export const commentConfig: CommentConfig = {
	type: "giscus",

	twikoo: {
		envId: "https://twikoo.vercel.app",
		lang: "zh-CN",
		visitorCount: true,
	},

	waline: {
		serverURL: "https://waline.vercel.app",
		lang: "zh-CN",
		login: "enable",
		visitorCount: true,
	},

	artalk: {
		server: "https://artalk.example.com/",
		locale: "zh-CN",
		visitorCount: true,
	},

	giscus: {
		repo: "DaozeTang/Blog",
		repoId: "R_kgDOQkCvvA",
		category: "Announcements",
		categoryId: "DIC_kwDOQkCvvM4Czis6",
		mapping: "pathname",
		strict: "0",
		reactionsEnabled: "1",
		emitMetadata: "1",
		inputPosition: "top",
		theme: "preferred_color_scheme",
		lang: "zh-CN",
		loading: "lazy",
	},

	disqus: {
		shortname: "firefly",
	},
};
