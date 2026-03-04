import { MongoClient, type Db, type Collection } from "mongodb";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Add it to .env (e.g. DATABASE_URL=mongodb://localhost:27017/samra).",
  );
}

const client = new MongoClient(process.env.DATABASE_URL);

let cachedDb: Db | null = null;

export async function getDb(): Promise<Db> {
  if (cachedDb) return cachedDb;
  await client.connect();
  const dbName = new URL(process.env.DATABASE_URL).pathname.slice(1) || "samra";
  cachedDb = client.db(dbName);
  return cachedDb;
}

export async function getCollection<T extends Document>(name: string): Promise<Collection<T>> {
  const db = await getDb();
  return db.collection<T>(name);
}

interface Document {
  _id?: unknown;
}
