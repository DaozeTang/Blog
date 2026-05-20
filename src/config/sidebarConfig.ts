import type { SidebarLayoutConfig } from "../types/config";

export const sidebarLayoutConfig: SidebarLayoutConfig = {
	enable: true,
	// "left" | "both"
	position: "both",

	// position: "top" | "sticky"
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
	],

	defaultAnimation: {
		enable: true,
		baseDelay: 0,
		increment: 50,
	},

	responsive: {
		// "hidden" | "drawer" | "sidebar"
		layout: {
			mobile: "sidebar",
			tablet: "sidebar",
			desktop: "sidebar",
		},
	},
};
