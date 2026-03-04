import { z } from "zod";

// MongoDB document types (with _id as string for API)
export const projectSchema = z.object({
  _id: z.string(),
  title: z.string(),
  description: z.string(),
  facebookUrl: z.string().nullable().optional(),
  category: z.string().default("General"),
  isFeatured: z.boolean().default(false),
  imageUrl: z.string().nullable().optional(),
});

export const articleSchema = z.object({
  _id: z.string(),
  title: z.string(),
  url: z.string(),
  platform: z.string().default("LinkedIn"),
  publishedAt: z.coerce.date().optional(),
});

export const contactSubmissionSchema = z.object({
  _id: z.string(),
  name: z.string(),
  email: z.string(),
  subject: z.string().nullable().optional(),
  message: z.string(),
  createdAt: z.coerce.date().optional(),
});

// Insert schemas (no _id)
export const insertProjectSchema = z.object({
  title: z.string(),
  description: z.string(),
  facebookUrl: z.string().nullable().optional(),
  category: z.string().default("General"),
  isFeatured: z.boolean().default(false),
  imageUrl: z.string().nullable().optional(),
});

export const insertArticleSchema = z.object({
  title: z.string(),
  url: z.string(),
  platform: z.string().default("LinkedIn"),
  publishedAt: z.coerce.date().optional(),
});

export const insertContactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  subject: z.string().optional().transform((v) => (v && v.trim().length > 0 ? v.trim() : undefined)),
  message: z.string().min(1, "Message is required"),
});

// API types (id from _id)
export type Project = Omit<z.infer<typeof projectSchema>, "_id"> & { id: string };
export type Article = Omit<z.infer<typeof articleSchema>, "_id"> & { id: string };
export type ContactSubmission = Omit<z.infer<typeof contactSubmissionSchema>, "_id"> & { id: string };

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type InsertContact = z.infer<typeof insertContactSchema>;
