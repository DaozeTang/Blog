import type { AdConfig } from "../types/config";

export const adConfig1: AdConfig = {
	image: {
		src: "/assets/images/d1.webp",
		alt: "广告横幅",
		link: "#",
		external: true,
	},
	closable: true,
	displayCount: -1,
	padding: {
		all: "0",
	},
};

export const adConfig2: AdConfig = {
	title: "支持博主",
	content:
		"如果您觉得本站内容对您有帮助，欢迎支持我们的创作！您的支持是我们持续更新的动力。",
	image: {
		src: "/assets/images/d2.webp",
		alt: "支持博主",
		link: "about/",
		external: false,
	},
	link: {
		text: "支持一下",
		url: "about/",
		external: false,
	},
	closable: true,
	displayCount: -1,
	padding: {
	},
};
