import { getCollection } from "./db";
import type { ObjectId } from "mongodb";
import type {
  Project,
  Article,
  ContactSubmission,
  InsertProject,
  InsertArticle,
  InsertContact,
} from "./shared/schema";

function toProject(doc: ProjectDoc): Project {
  const { _id, ...rest } = doc;
  return { id: String(_id), ...rest } as Project;
}

function toArticle(doc: ArticleDoc): Article {
  const { _id, ...rest } = doc;
  return { id: String(_id), ...rest } as Article;
}

function toContact(doc: ContactDoc): ContactSubmission {
  const { _id, ...rest } = doc;
  return { id: String(_id), ...rest } as ContactSubmission;
}

interface ProjectDoc extends InsertProject {
  _id: ObjectId;
  createdAt?: Date;
}

interface ArticleDoc extends InsertArticle {
  _id: ObjectId;
  publishedAt?: Date;
}

interface ContactDoc extends InsertContact {
  _id: ObjectId;
  createdAt?: Date;
}

export interface IStorage {
  getProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProjectImageUrl(id: string, imageUrl: string): Promise<void>;

  getArticles(): Promise<Article[]>;
  createArticle(article: InsertArticle): Promise<Article>;

  submitContact(contact: InsertContact): Promise<ContactSubmission>;
}

export class DatabaseStorage implements IStorage {
  async getProjects(): Promise<Project[]> {
    const col = await getCollection<ProjectDoc>("projects");
    const docs = await col.find({}).toArray();
    return docs.map(toProject);
  }

  async getProject(id: string): Promise<Project | undefined> {
    const { ObjectId } = await import("mongodb");
    let oid: ObjectId;
    try {
      oid = new ObjectId(id);
    } catch {
      return undefined;
    }
    const col = await getCollection<ProjectDoc>("projects");
    const doc = await col.findOne({ _id: oid });
    return doc ? toProject(doc) : undefined;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const col = await getCollection<ProjectDoc>("projects");
    const { insertedId } = await col.insertOne(project as ProjectDoc);
    const doc = await col.findOne({ _id: insertedId });
    return toProject(doc!);
  }

  async updateProjectImageUrl(id: string, imageUrl: string): Promise<void> {
    const { ObjectId } = await import("mongodb");
    try {
      const col = await getCollection<ProjectDoc>("projects");
      await col.updateOne({ _id: new ObjectId(id) }, { $set: { imageUrl } });
    } catch {
      // ignore invalid id
    }
  }

  async getArticles(): Promise<Article[]> {
    const col = await getCollection<ArticleDoc>("articles");
    const docs = await col.find({}).toArray();
    return docs.map(toArticle);
  }

  async createArticle(article: InsertArticle): Promise<Article> {
    const col = await getCollection<ArticleDoc>("articles");
    const doc = { ...article, publishedAt: article.publishedAt ?? new Date() };
    const { insertedId } = await col.insertOne(doc as ArticleDoc);
    const inserted = await col.findOne({ _id: insertedId });
    return toArticle(inserted!);
  }

  async submitContact(contact: InsertContact): Promise<ContactSubmission> {
    const col = await getCollection<ContactDoc>("contactSubmissions");
    const doc = { ...contact, createdAt: new Date() };
    const { insertedId } = await col.insertOne(doc as ContactDoc);
    const inserted = await col.findOne({ _id: insertedId });
    return toContact(inserted!);
  }
}

export const storage = new DatabaseStorage();
