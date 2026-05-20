import type { Live2DModelConfig, SpineModelConfig } from "../types/config";

export const spineModelConfig: SpineModelConfig = {
	enable: false,
	model: { path: "" },
	position: { corner: "bottom-left" },
	size: {},
};

export const live2dModelConfig: Live2DModelConfig = {
	enable: false,
	model: { path: "" },
};
