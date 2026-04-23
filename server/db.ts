import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, subscriptions, proposals, lineItems, companySettings, templates, signatures, Proposal, Subscription, CompanySettings, LineItem, Template, Signature } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getSubscription(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createSubscription(data: typeof subscriptions.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(subscriptions).values(data);
  return result;
}

export async function updateSubscription(id: number, data: Partial<typeof subscriptions.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(subscriptions).set(data).where(eq(subscriptions.id, id));
}

export async function getCompanySettings(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(companySettings).where(eq(companySettings.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertCompanySettings(userId: number, data: Partial<typeof companySettings.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getCompanySettings(userId);
  if (existing) {
    return db.update(companySettings).set(data).where(eq(companySettings.userId, userId));
  } else {
    return db.insert(companySettings).values({ userId, ...data });
  }
}

export async function getProposals(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(proposals).where(eq(proposals.userId, userId)).orderBy(desc(proposals.createdAt));
}

export async function getProposal(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(proposals).where(eq(proposals.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createProposal(data: typeof proposals.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(proposals).values(data);
  return result;
}

export async function updateProposal(id: number, data: Partial<typeof proposals.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(proposals).set(data).where(eq(proposals.id, id));
}

export async function getLineItems(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(lineItems).where(eq(lineItems.userId, userId)).orderBy(desc(lineItems.createdAt));
}

export async function createLineItem(data: typeof lineItems.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(lineItems).values(data);
  return result;
}

export async function deleteLineItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(lineItems).where(eq(lineItems.id, id));
}

export async function getTemplates() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(templates).orderBy(templates.trade);
}

export async function getTemplate(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(templates).where(eq(templates.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createSignature(data: typeof signatures.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(signatures).values(data);
  return result;
}

export async function getSignature(proposalId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(signatures).where(eq(signatures.proposalId, proposalId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}
