import type { SponsorConfig } from "../types/config";

export const sponsorConfig: SponsorConfig = {
	title: "",
	description: "",
	usage: "您的赞助将用于服务器维护、内容创作和功能开发，帮助我持续提供优质内容。",
	showSponsorsList: true,
	showButtonInPost: true,

	methods: [
		{
			name: "支付宝",
			icon: "fa6-brands:alipay",
			qrCode: "/assets/images/sponsor/alipay.jpg",
			link: "",
			description: "使用 支付宝 扫码赞助",
			enabled: true,
		},
		{
			name: "微信",
			icon: "fa6-brands:weixin",
			qrCode: "/assets/images/sponsor/wechat.jpg",
			link: "",
			description: "使用 微信 扫码赞助",
			enabled: true,
		},
		{
			name: "爱发电",
			icon: "simple-icons:afdian",
			qrCode: "",
			link: "https://afdian.com/a/cuteleaf",
			description: "通过 爱发电 进行赞助",
			enabled: false,
		},
		{
			name: "Github",
			icon: "fa6-brands:github",
			qrCode: "",
			link: "https://github.com/DaozeTang",
			description: "点个Star就是最大的支持",
			enabled: false,
		},
	],

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
