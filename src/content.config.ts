import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
const postsCollection = defineCollection({
		prevTitle: z.string().default(""),
		prevSlug: z.string().default(""),
		nextTitle: z.string().default(""),
		nextSlug: z.string().default(""),
	}),
});
const specCollection = defineCollection({
