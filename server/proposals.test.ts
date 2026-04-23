import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock db module
vi.mock("./db", () => ({
  seedTemplates: vi.fn().mockResolvedValue(undefined),
  getProposals: vi.fn().mockResolvedValue([]),
  getProposal: vi.fn().mockResolvedValue(undefined),
  createProposal: vi.fn().mockResolvedValue({ insertId: 1 }),
  updateProposal: vi.fn().mockResolvedValue({}),
  deleteProposal: vi.fn().mockResolvedValue({}),
  getDashboardStats: vi.fn().mockResolvedValue({
    total: 5,
    sent: 3,
    sentThisMonth: 2,
    signed: 1,
    avgDealSize: 1500,
    closeRate: 33,
  }),
  getTemplates: vi.fn().mockResolvedValue([
    { id: 1, name: "Roof Repair", trade: "Roofing" },
    { id: 2, name: "Plumbing Service Call", trade: "Plumbing" },
  ]),
  getTemplate: vi.fn().mockResolvedValue({ id: 1, name: "Roof Repair", trade: "Roofing" }),
  getLineItems: vi.fn().mockResolvedValue([]),
  createLineItem: vi.fn().mockResolvedValue({ insertId: 1 }),
  deleteLineItem: vi.fn().mockResolvedValue({}),
  getSubscription: vi.fn().mockResolvedValue(null),
  createSubscription: vi.fn().mockResolvedValue({ insertId: 1 }),
  getCompanySettings: vi.fn().mockResolvedValue(null),
  upsertCompanySettings: vi.fn().mockResolvedValue({}),
  createSignature: vi.fn().mockResolvedValue({ insertId: 1 }),
  getSignature: vi.fn().mockResolvedValue(undefined),
  getAdminStats: vi.fn().mockResolvedValue({
    totalUsers: 10,
    activeSubscriptions: 5,
    monthlySubscriptions: 3,
    lifetimeSubscriptions: 2,
    totalProposals: 25,
    totalRevenue: 315,
    proposalsByStatus: { draft: 5, sent: 8, viewed: 6, signed: 4, declined: 2 },
  }),
  getRecentUsers: vi.fn().mockResolvedValue([]),
  getRecentSubscriptions: vi.fn().mockResolvedValue([]),
}));

function makeCtx(overrides: Partial<TrpcContext> = {}): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
    ...overrides,
  };
}

function makeAdminCtx(): TrpcContext {
  return makeCtx({
    user: {
      id: 99,
      openId: "admin-user",
      email: "admin@example.com",
      name: "Admin User",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
  });
}

describe("proposals router", () => {
  it("lists proposals for authenticated user", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.proposals.list({});
    expect(Array.isArray(result)).toBe(true);
  });

  it("returns stats for authenticated user", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const stats = await caller.proposals.stats();
    expect(stats).toMatchObject({ total: 5, closeRate: 33 });
  });

  it("creates a proposal", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.proposals.create({ clientName: "John Smith" });
    expect(result).toBeDefined();
  });
});

describe("templates router", () => {
  it("lists all templates", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const templates = await caller.templates.list();
    expect(templates.length).toBe(2);
    expect(templates[0].trade).toBe("Roofing");
  });

  it("gets a single template", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const template = await caller.templates.get({ id: 1 });
    expect(template?.name).toBe("Roof Repair");
  });
});

describe("subscription router", () => {
  it("returns null subscription for unauthenticated user", async () => {
    const caller = appRouter.createCaller({ ...makeCtx(), user: null });
    const sub = await caller.subscription.get();
    expect(sub).toBeNull();
  });

  it("returns stripe public key", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.subscription.getPublicKey();
    expect(result.publicKey).toBeDefined();
    expect(typeof result.publicKey).toBe("string");
  });

  it("creates checkout stub for monthly plan", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.subscription.createCheckout({ plan: "monthly" });
    expect(result.stub).toBe(true);
    expect(result.amount).toBe(39);
  });

  it("creates checkout stub for lifetime plan", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.subscription.createCheckout({ plan: "lifetime" });
    expect(result.stub).toBe(true);
    expect(result.amount).toBe(99);
  });
});

describe("admin router", () => {
  it("blocks non-admin users", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(caller.admin.stats()).rejects.toThrow();
  });

  it("returns stats for admin users", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const stats = await caller.admin.stats();
    expect(stats.totalUsers).toBe(10);
    expect(stats.totalRevenue).toBe(315);
  });

  it("returns recent users for admin", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const users = await caller.admin.recentUsers();
    expect(Array.isArray(users)).toBe(true);
  });
});

describe("companySettings router", () => {
  it("returns null for unauthenticated user", async () => {
    const caller = appRouter.createCaller({ ...makeCtx(), user: null });
    const settings = await caller.companySettings.get();
    expect(settings).toBeNull();
  });

  it("upserts company settings", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.companySettings.upsert({
      companyName: "Acme Roofing",
      phone: "555-1234",
    });
    expect(result).toBeDefined();
  });
});
