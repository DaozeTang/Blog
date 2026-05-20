import type { SidebarLayoutConfig } from "../types/config";

export const sidebarLayoutConfig: SidebarLayoutConfig = {
	enable: true,

	position: "both",

	leftComponents: [
		{
			type: "profile",
			enable: true,
			order: 1,
			position: "top",
			class: "onload-animation",
			animationDelay: 0,
		},
		{
			type: "announcement",
			enable: true,
			order: 2,
			position: "top",
			class: "onload-animation",
			animationDelay: 50,
		},
		{
			type: "categories",
			enable: true,
			order: 3,
			position: "sticky",
			class: "onload-animation",
			animationDelay: 150,
			responsive: {
				collapseThreshold: 5,
			},
		},
		{
			type: "tags",
			enable: true,
			order: 4,
			position: "sticky",
			class: "onload-animation",
			animationDelay: 250,
			responsive: {
				collapseThreshold: 20,
			},
		},
		{
			type: "advertisement",
			enable: false,
			order: 5,
			position: "sticky",
			class: "onload-animation",
			animationDelay: 300,
			configId: "ad1",
		},
	],

	rightComponents: [
		{
			type: "stats",
			enable: true,
			order: 1,
			position: "top",
			showOnPostPage: true,
			class: "onload-animation",
			animationDelay: 200,
		},
		{
			type: "calendar",
			enable: true,
			order: 2,
			position: "sticky",
			showOnPostPage: false,
			class: "onload-animation",
			animationDelay: 250,
		},
		{
			type: "sidebarToc",
			enable: true,
			order: 3,
			position: "sticky",
			showOnPostPage: true,
			class: "onload-animation",
			animationDelay: 250,
		},
		{
			type: "advertisement",
			enable: false,
			order: 4,
			position: "sticky",
			showOnPostPage: true,
			class: "onload-animation",
			animationDelay: 350,
			configId: "ad2",
		},
	],

	defaultAnimation: {
		enable: true,
		baseDelay: 0,
		increment: 50,
	},

	responsive: {
		layout: {
			mobile: "sidebar",
			tablet: "sidebar",
			desktop: "sidebar",
		},
	},
};
