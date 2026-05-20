import { getImage } from "astro:assets";
import type { RSSFeedItem } from "@astrojs/rss";
import rss from "@astrojs/rss";
import type { APIContext, ImageMetadata } from "astro";
import { parse as htmlParser } from "node-html-parser";
import { getSortedPosts } from "@/utils/content-utils";
import { siteConfig } from "../config";

// Matches control chars except \t \n \r — built dynamically to avoid lint warnings
const controlCharsPattern = new RegExp(
	`[${String.fromCharCode(0)}-${String.fromCharCode(8)}${String.fromCharCode(11)}${String.fromCharCode(12)}${String.fromCharCode(14)}-${String.fromCharCode(31)}${String.fromCharCode(127)}]`,
	"g",
);

function sanitizeXmlContent(content: string): string {
	return content
		.replace(controlCharsPattern, "")
		.replace(/&(?!amp;|lt;|gt;|quot;|apos;)/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");
}

function sanitizeHtmlForXml(content: string): string {
	return content
		.replace(controlCharsPattern, "")
		.replace(/&(?!amp;|lt;|gt;|quot;|apos;)/g, "&amp;");
}

const CONTENT_POSTS_PATH = "/src/content/posts";
const CONTENT_PATH = "/src/content";

const imagesGlob = import.meta.glob<{ default: ImageMetadata }>(
	"/src/content/**/*.{jpeg,jpg,png,gif,webp}",
);

function getPostDirectory(postId: string): string {
	return postId.includes("/") ? postId.split("/")[0] : "";
}

function buildImageImportPath(src: string, postId: string): string | null {
	if (src.startsWith("./")) {
		const prefixRemoved = src.slice(2);
		const postDir = getPostDirectory(postId);
		return postDir
			? `${CONTENT_POSTS_PATH}/${postDir}/${prefixRemoved}`
			: `${CONTENT_POSTS_PATH}/${prefixRemoved}`;
	}
	if (src.startsWith("../")) {
		const cleaned = src.replace(/^\.\.\//, "");
		return `${CONTENT_PATH}/${cleaned}`;
	}
	const postDir = getPostDirectory(postId);
	return postDir
		? `${CONTENT_POSTS_PATH}/${postDir}/${src}`
		: `${CONTENT_POSTS_PATH}/${src}`;
}

export async function GET(context: APIContext) {
	if (!context.site) {
		throw new Error("site not set");
	}

	type MarkdownItConstructor = new () => { render: (md: string) => string };
	type SanitizeHtmlFn = {
		(dirty: string, options?: { allowedTags?: string[] }): string;
		defaults: { allowedTags: string[] };
	};

	const markdownItModule = await import("markdown-it");
	const sanitizeHtmlModule = await import("sanitize-html");

	const MarkdownIt = (markdownItModule.default ||
		markdownItModule) as MarkdownItConstructor;
	const sanitizeHtml = (sanitizeHtmlModule.default ||
		sanitizeHtmlModule) as SanitizeHtmlFn;
	const markdownParser = new MarkdownIt();

	const posts = await getSortedPosts();
	const feed: RSSFeedItem[] = [];

	const processedPosts = await Promise.all(
		posts.map(async (post) => {
			const body = markdownParser.render(post.body ?? "");
			const html = htmlParser.parse(body);
			const images = html.querySelectorAll("img");

			await Promise.all(
				images.map(async (img) => {
					const src = img.getAttribute("src");
					if (!src) return;

					if (
						src.startsWith("./") ||
						src.startsWith("../") ||
						(!src.startsWith("http") && !src.startsWith("/"))
					) {
						const importPath = buildImageImportPath(src, post.id);
						if (!importPath) return;

						try {
							const imageMod = await imagesGlob[importPath]?.()?.then(
								(res) => res.default,
							);
							if (imageMod) {
								const optimizedImg = await getImage({ src: imageMod });
								img.setAttribute(
									"src",
									new URL(optimizedImg.src, context.site).href,
								);
							} else if (import.meta.env.DEV) {
								console.warn(
									`Failed to load image: ${importPath} for post: ${post.id}`,
								);
							}
						} catch (error) {
							if (import.meta.env.DEV) {
								console.error(
									`Error loading image ${importPath} for post ${post.id}:`,
									error,
								);
							}
						}
					} else if (src.startsWith("/")) {
						img.setAttribute("src", new URL(src, context.site).href);
					}
				}),
			);

			return { post, html };
		}),
	);

	for (const { post, html } of processedPosts) {
		feed.push({
			title: sanitizeXmlContent(post.data.title),
			description: sanitizeXmlContent(post.data.description || ""),
			pubDate: post.data.published,
			link: `/posts/${post.id}/`,
			content: sanitizeHtmlForXml(
				sanitizeHtml(html.toString(), {
					allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
				}),
			),
		});
	}

	return rss({
		title:
			sanitizeXmlContent(siteConfig.title) +
			" - " +
			sanitizeXmlContent(siteConfig.subtitle),
		description: sanitizeXmlContent(
			siteConfig.description || siteConfig.subtitle || "No description",
		),
		site: context.site,
		items: feed,
		customData: `<language>${sanitizeXmlContent(siteConfig.lang)}</language>`,
	});
}
