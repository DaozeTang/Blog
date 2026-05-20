import type { MusicPlayerConfig } from "../types/config";

export const musicPlayerConfig: MusicPlayerConfig = {
	enable: false,

	mode: "meting",

	meting: {
		api: "https://api.i-meto.com/meting/api?server=:server&type=:type&id=:id&r=:r",

		server: "netease",

		type: "playlist",

		id: "10046455237",

		auth: "",

		fallbackApis: [
			"https://api.injahow.cn/meting/?server=:server&type=:type&id=:id",
			"https://api.moeyao.cn/meting/?server=:server&type=:type&id=:id",
		],

		jsPath: "https://unpkg.com/meting@2/dist/Meting.min.js",
	},

	local: {
		playlist: [
			{
				name: "使一颗心免于哀伤",
				artist: "知更鸟 / HOYO-MiX / Chevy",
				url: "/assets/music/使一颗心免于哀伤-哼唱.wav",
				cover: "/assets/music/cover/109951169585655912.jpg",
				lrc: "",
			},
		],
	},

	player: {
		autoplay: false,

		theme: "var(--btn-regular-bg)",

		loop: "all",

		order: "list",

		preload: "auto",

		volume: 0.7,

		mutex: true,

		lrcType: 1,

		lrcHidden: true,

		listFolded: false,

		listMaxHeight: "340px",

		storageName: "aplayer-setting",
	},

	responsive: {
		mobile: {
			hide: false,

			breakpoint: 768,
		},
	},
};
