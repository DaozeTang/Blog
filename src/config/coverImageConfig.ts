import type { CoverImageConfig } from "../types/config";

// 在文章 Frontmatter 中设置 image: "api" 即可使用随机封面图
export const coverImageConfig: CoverImageConfig = {
	enable: false,
	apis: [
		"https://t.alcy.cc/pc",
		"https://www.dmoe.cc/random.php",
		"https://uapis.cn/api/v1/random/image?category=acg&type=pc",
	],
	// 备用图片路径
	fallback: "/assets/images/cover.webp",

	loading: {
		enable: false,
		image: "/assets/images/loading.gif",
		backgroundColor: "#fefefe",
	},

	watermark: {
		enable: true,
		text: "Random Cover",
		// "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center"
		position: "bottom-right",
		opacity: 0.6,
		fontSize: "0.75rem",
		color: "#ffffff",
		backgroundColor: "rgba(0, 0, 0, 0.5)",
	},
};
