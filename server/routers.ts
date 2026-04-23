import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";

// Seed templates on startup
db.seedTemplates().catch(console.error);

// Stripe stub - uses test keys or env vars
const STRIPE_PUBLIC_KEY = process.env.STRIPE_PUBLIC_KEY || "pk_test_stub_service_proposal_builder";
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "sk_test_stub_service_proposal_builder";
const STRIPE_MONTHLY_PRICE = process.env.STRIPE_MONTHLY_PRICE_ID || "price_monthly_39";
const STRIPE_LIFETIME_PRICE = process.env.STRIPE_LIFETIME_PRICE_ID || "price_lifetime_99";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  proposals: router({
    list: publicProcedure
      .input(z.object({ status: z.string().optional() }).optional())
      .query(async ({ ctx, input }) => {
        if (!ctx.user) return [];
        const all = await db.getProposals(ctx.user.id);
        if (input?.status && input.status !== "all") {
          return all.filter((p) => p.status === input.status);
        }
        return all;
      }),
    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getProposal(input.id);
      }),
    create: publicProcedure
      .input(
        z.object({
          clientName: z.string(),
          clientAddress: z.string().optional(),
          clientEmail: z.string().email().optional(),
          clientPhone: z.string().optional(),
          templateId: z.number().optional(),
          scopeOfWork: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        return db.createProposal({ userId: ctx.user.id, ...input });
      }),
    update: publicProcedure
      .input(
        z.object({
          id: z.number(),
          clientName: z.string().optional(),
          clientAddress: z.string().optional(),
          clientEmail: z.string().email().optional(),
          clientPhone: z.string().optional(),
          scopeOfWork: z.string().optional(),
          status: z.enum(["draft", "sent", "viewed", "signed", "declined"]).optional(),
          pricingData: z.any().optional(),
          timeline: z.string().optional(),
          terms: z.string().optional(),
          subtotal: z.string().optional(),
          tax: z.string().optional(),
          discount: z.string().optional(),
          total: z.string().optional(),
          pdfUrl: z.string().optional(),
          pdfKey: z.string().optional(),
          sentAt: z.date().optional(),
          viewedAt: z.date().optional(),
          signedAt: z.date().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateProposal(id, data);
      }),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteProposal(input.id);
      }),
    stats: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) return { total: 0, sent: 0, sentThisMonth: 0, signed: 0, avgDealSize: 0, closeRate: 0 };
      return db.getDashboardStats(ctx.user.id);
    }),
  }),

  templates: router({
    list: publicProcedure.query(async () => {
      return db.getTemplates();
    }),
    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getTemplate(input.id);
      }),
  }),

  lineItems: router({
    list: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) return [];
      return db.getLineItems(ctx.user.id);
    }),
    create: publicProcedure
      .input(
        z.object({
          description: z.string(),
          unit: z.string().optional(),
          unitPrice: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        return db.createLineItem({ userId: ctx.user.id, ...input });
      }),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteLineItem(input.id);
      }),
  }),

  subscription: router({
    get: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) return null;
      return db.getSubscription(ctx.user.id);
    }),
    getPublicKey: publicProcedure.query(() => {
      return { publicKey: STRIPE_PUBLIC_KEY };
    }),
    createCheckout: publicProcedure
      .input(z.object({ plan: z.enum(["monthly", "lifetime"]), coupon: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        // Stub: In production, create a real Stripe checkout session
        // using STRIPE_SECRET_KEY, STRIPE_MONTHLY_PRICE / STRIPE_LIFETIME_PRICE
        console.log(`[Stripe Stub] Creating checkout for user ${ctx.user.id}, plan: ${input.plan}, coupon: ${input.coupon}`);
        const amount = input.plan === "lifetime" ? 99 : 39;
        return {
          stub: true,
          plan: input.plan,
          amount,
          message: `Stripe TEST MODE - ${input.plan === "lifetime" ? "$99 Lifetime" : "$39/month"} plan`,
          // In production: return { url: checkoutSession.url }
        };
      }),
    activate: publicProcedure
      .input(z.object({ plan: z.enum(["monthly", "lifetime"]) }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        return db.createSubscription({
          userId: ctx.user.id,
          plan: input.plan,
          status: "active",
        });
      }),
  }),

  companySettings: router({
    get: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) return null;
      return db.getCompanySettings(ctx.user.id);
    }),
    upsert: publicProcedure
      .input(
        z.object({
          companyName: z.string().optional(),
          address: z.string().optional(),
          phone: z.string().optional(),
          email: z.string().email().optional(),
          licenseNumber: z.string().optional(),
          logoUrl: z.string().optional(),
          logoKey: z.string().optional(),
          primaryColor: z.string().optional(),
          accentColor: z.string().optional(),
          defaultTerms: z.string().optional(),
          defaultPaymentTerms: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        return db.upsertCompanySettings(ctx.user.id, input);
      }),
  }),

  signatures: router({
    create: publicProcedure
      .input(
        z.object({
          proposalId: z.number(),
          signerName: z.string(),
          signatureDataUrl: z.string().optional(),
          ipAddress: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return db.createSignature(input);
      }),
    get: publicProcedure
      .input(z.object({ proposalId: z.number() }))
      .query(async ({ input }) => {
        return db.getSignature(input.proposalId);
      }),
  }),

  admin: router({
    stats: adminProcedure.query(async () => {
      return db.getAdminStats();
    }),
    recentUsers: adminProcedure.query(async () => {
      return db.getRecentUsers(20);
    }),
    recentSubscriptions: adminProcedure.query(async () => {
      return db.getRecentSubscriptions(20);
    }),
  }),
});

export type AppRouter = typeof appRouter;
