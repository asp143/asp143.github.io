import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    canonical: z.string().url().optional()
  })
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    name: z.string(),
    title: z.string(),
    description: z.string(),
    summary: z.string(),
    stack: z.array(z.string()).default([]),
    tech: z.string().optional(),
    role: z.string().optional(),
    year: z.string().optional(),
    status: z.enum(['active', 'shipped', 'archived', 'ongoing']).default('shipped'),
    featured: z.boolean().default(false),
    order: z.number().default(0),
    links: z
      .array(z.object({ label: z.string(), url: z.string().url() }))
      .default([]),
    keywords: z.array(z.string()).default([]),
    updatedDate: z.coerce.date().optional(),
    draft: z.boolean().default(false),
    canonical: z.string().url().optional()
  })
});

export const collections = { blog, projects };
