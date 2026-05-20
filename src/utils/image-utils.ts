export function processCoverImage(image: string | undefined, _seed?: string): Promise<string> {
	return Promise.resolve(image || "");
}

export function processCoverImageSync(image: string | undefined, _seed?: string): string {
	return image || "";
}
