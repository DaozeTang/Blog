import { h } from "hastscript";
import { visit } from "unist-util-visit";

// 来自霞葉： https://kasuha.com/posts/fuwari-enhance-ep1/

export default function rehypeFigure() {
	return (tree) => {
		visit(tree, "element", (node, index, parent) => {
			if (node.tagName !== "img") return;

			const alt = node.properties?.alt;
			if (!alt || alt.trim() === "") return;

			const figure = h("figure", [
				h("img", { ...node.properties, alt: "" }),
				h("figcaption", alt),
			]);

			const centerFigure = h("center", figure);

			if (parent && typeof index === "number") {
				parent.children[index] = centerFigure;
			}
		});
	};
}
