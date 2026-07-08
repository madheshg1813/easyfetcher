import { defineField, defineType } from "sanity";

export const blogPost = defineType({
  name: "blogPost",
  title: "Blog Post",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
      validation: (r) => r.required().max(200),
    }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "coverLabel",
      title: "Cover Label (short word on generated cover, e.g. \"Skills\")",
      type: "string",
    }),
    defineField({
      name: "coverLogo",
      title: "Cover Logo",
      type: "string",
      options: { list: ["claude", "chatgpt", "perplexity", "gemini"] },
    }),
    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: ["SEO", "Analytics", "Ads", "Product", "Tutorial"],
      },
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [
        { type: "block" },
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({ name: "alt", type: "string", title: "Alt text" }),
            defineField({ name: "caption", type: "string", title: "Caption" }),
          ],
        },
        {
          type: "object",
          name: "table",
          title: "Table",
          fields: [
            defineField({
              name: "rows",
              type: "array",
              of: [
                {
                  type: "object",
                  name: "tableRow",
                  fields: [
                    defineField({ name: "header", type: "boolean" }),
                    defineField({ name: "cells", type: "array", of: [{ type: "string" }] }),
                  ],
                },
              ],
            }),
          ],
        },
      ],
    }),
    defineField({
      name: "faqs",
      title: "FAQs",
      type: "array",
      of: [
        {
          type: "object",
          name: "faq",
          fields: [
            defineField({ name: "q", title: "Question", type: "string" }),
            defineField({ name: "a", title: "Answer", type: "text", rows: 4 }),
          ],
          preview: { select: { title: "q" } },
        },
      ],
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "publishedAt", media: "coverImage" },
  },
});
