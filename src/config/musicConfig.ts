import type { MusicPlayerConfig } from "../types/config";

export const musicPlayerConfig: MusicPlayerConfig = {
	enable: false,
	// "meting" | "local"
	mode: "meting",

	meting: {
		api: "https://api.i-meto.com/meting/api?server=:server&type=:type&id=:id&r=:r",
		// netease | tencent | kugou | xiami | baidu
		server: "netease",
		// song | playlist | album | search | artist
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
		playlist: [],
	},

	player: {
		autoplay: false,
		theme: "var(--btn-regular-bg)",
		// "all" | "one" | "none"
		loop: "all",
		// "list" | "random"
		order: "list",
		// "none" | "metadata" | "auto"
		preload: "auto",
		volume: 0.7,
		mutex: true,
		// 0=不显示, 1=显示(需lrc字段), 2=从HTML读取
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
