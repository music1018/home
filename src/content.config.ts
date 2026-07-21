import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		// Transform string to Date object
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		heroImage: z.string().optional(),
	}),
});

const books = defineCollection({
	loader: glob({ base: './src/content/books', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		title: z.string(),
		subtitle: z.string().optional(),
		author: z.string(),
		cover: z.string().optional(),
		rating: z.number().min(1).max(5),
		status: z.enum(['completed', 'diving', 'anchor']), // completed: 読破, diving: 読書中, anchor: 座右の書
		recommendTo: z.string(),
		tags: z.array(z.string()),
		depth: z.number(), // 思考の深度 (例: 300, 1200, 2500)
		readDate: z.string(),
		summary: z.string(),
		highlightQuote: z.string().optional(),
		practiceLinks: z.array(z.object({
			label: z.string(),
			url: z.string(),
			type: z.enum(['blog', 'github', 'work']),
		})).optional(),
		nextReads: z.array(z.object({
			targetSlug: z.string(),
			relation: z.string(),
			reason: z.string()
		})).optional(),
	}),
});

export const collections = { blog, books };
