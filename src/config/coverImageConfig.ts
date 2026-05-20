import type { CoverImageConfig } from "../types/config";

export const coverImageConfig: CoverImageConfig = {
	enable: false,
	apis: [
		"https://t.alcy.cc/pc",
		"https://www.dmoe.cc/random.php",
		"https://uapis.cn/api/v1/random/image?category=acg&type=pc",
	],
	fallback: "/assets/images/cover.webp",

	loading: {
		enable: false,
		image: "/assets/images/loading.gif",
		backgroundColor: "#fefefe",
	},

	watermark: {
		enable: true,
		text: "Random Cover",
		position: "bottom-right",
		opacity: 0.6,
		fontSize: "0.75rem",
		color: "#ffffff",
		backgroundColor: "rgba(0, 0, 0, 0.5)",
	},
};
