import type { ProfileConfig } from "../types/config";

export const profileConfig: ProfileConfig = {
	avatar: "/assets/images/avatar.jpg",
	name: "Daoze Tang",
	bio: "Hello, I'm Daoze Tang.",
	links: [
		{
			name: "Homepage",
			icon: "fa6-solid:globe",
			url: "https://dztang.net/",
		},
		{
			name: "Email",
			icon: "fa6-solid:envelope",
			url: "mailto:tdz@s.hrbcu.edu.cn",
			showName: false,
		},
		{
			name: "GitHub",
			icon: "fa6-brands:github",
			url: "https://github.com/DaozeTang",
			showName: false,
		},
	],
};
