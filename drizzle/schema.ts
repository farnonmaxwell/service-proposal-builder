import { decimal, int, json, longtext, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  plan: mysqlEnum("plan", ["monthly", "lifetime"]).notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 128 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 128 }),
  status: mysqlEnum("status", ["active", "canceled", "past_due"]).default("active").notNull(),
  currentPeriodStart: timestamp("currentPeriodStart"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

export const companySettings = mysqlTable("companySettings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  companyName: varchar("companyName", { length: 255 }),
  address: varchar("address", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  licenseNumber: varchar("licenseNumber", { length: 255 }),
  logoUrl: varchar("logoUrl", { length: 512 }),
  logoKey: varchar("logoKey", { length: 255 }),
  primaryColor: varchar("primaryColor", { length: 7 }).default("#475569"),
  accentColor: varchar("accentColor", { length: 7 }).default("#22c55e"),
  defaultTerms: longtext("defaultTerms"),
  defaultPaymentTerms: varchar("defaultPaymentTerms", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CompanySettings = typeof companySettings.$inferSelect;
export type InsertCompanySettings = typeof companySettings.$inferInsert;

export const templates = mysqlTable("templates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  trade: varchar("trade", { length: 255 }).notNull(),
  category: varchar("category", { length: 255 }),
  scopeTemplate: longtext("scopeTemplate"),
  termsTemplate: longtext("termsTemplate"),
  timelineTemplate: longtext("timelineTemplate"),
  isDefault: int("isDefault").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Template = typeof templates.$inferSelect;
export type InsertTemplate = typeof templates.$inferInsert;

export const lineItems = mysqlTable("lineItems", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  description: varchar("description", { length: 512 }).notNull(),
  unit: varchar("unit", { length: 50 }).default("each"),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  isTemplate: int("isTemplate").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LineItem = typeof lineItems.$inferSelect;
export type InsertLineItem = typeof lineItems.$inferInsert;

export const proposals = mysqlTable("proposals", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  clientName: varchar("clientName", { length: 255 }).notNull(),
  clientAddress: varchar("clientAddress", { length: 512 }),
  clientEmail: varchar("clientEmail", { length: 320 }),
  clientPhone: varchar("clientPhone", { length: 20 }),
  templateId: int("templateId"),
  status: mysqlEnum("status", ["draft", "sent", "viewed", "signed", "declined"]).default("draft").notNull(),
  scopeOfWork: longtext("scopeOfWork"),
  pricingData: json("pricingData"),
  timeline: longtext("timeline"),
  terms: longtext("terms"),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).default("0"),
  tax: decimal("tax", { precision: 12, scale: 2 }).default("0"),
  discount: decimal("discount", { precision: 12, scale: 2 }).default("0"),
  total: decimal("total", { precision: 12, scale: 2 }).default("0"),
  pdfUrl: varchar("pdfUrl", { length: 512 }),
  pdfKey: varchar("pdfKey", { length: 255 }),
  sentAt: timestamp("sentAt"),
  viewedAt: timestamp("viewedAt"),
  signedAt: timestamp("signedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Proposal = typeof proposals.$inferSelect;
export type InsertProposal = typeof proposals.$inferInsert;

export const signatures = mysqlTable("signatures", {
  id: int("id").autoincrement().primaryKey(),
  proposalId: int("proposalId").notNull(),
  signerName: varchar("signerName", { length: 255 }).notNull(),
  signatureDataUrl: longtext("signatureDataUrl"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  signedAt: timestamp("signedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Signature = typeof signatures.$inferSelect;
export type InsertSignature = typeof signatures.$inferInsert;