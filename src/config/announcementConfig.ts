import type { AnnouncementConfig } from "../types/config";

export const announcementConfig: AnnouncementConfig = {
	title: "欢迎",
	content: "欢迎来到我的博客！",
	closable: true,
	link: {
		enable: true,
		text: "了解我",
		url: "/about/",
		external: false,
	},
};
