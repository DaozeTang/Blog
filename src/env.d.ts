declare global {
	interface ImportMetaEnv {
		readonly MEILI_MASTER_KEY: string;
	}
	interface ITOCManager {
		init: () => void;
		cleanup: () => void;
	}
	interface Window {
		SidebarTOC: {
			manager: ITOCManager | null;
		};
		FloatingTOC: {
			btn: HTMLElement | null;
			panel: HTMLElement | null;
			manager: ITOCManager | null;
			isPostPage: () => boolean;
		};
		toggleFloatingTOC: () => void;
		tocInternalNavigation: boolean;
		iconifyLoaded: boolean;
		spine: any;
		closeAnnouncement: () => void;
		__iconifyLoader: any;
		__iconifyLoaderInitialized: boolean;
		loadIconify: () => Promise<void>;
		preloadIcons: (icons: string | string[]) => void;
		onIconifyReady: (callback: () => void) => void;
	}
}
export {};
