import type { SponsorConfig } from "../types/config";

export const sponsorConfig: SponsorConfig = {
	title: "",
	description: "",
	usage: "您的赞助将用于服务器维护、内容创作和功能开发，帮助我持续提供优质内容。",
	showSponsorsList: true,
	showButtonInPost: true,

	methods: [],

	sponsors: [
		{
			name: "匿名用户",
			amount: "¥30",
			date: "2025-08-06",
		},
		{
			name: "匿名用户",
			amount: "¥10",
			date: "2024-06-19",
		},
	],
};
