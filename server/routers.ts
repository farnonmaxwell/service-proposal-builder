import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  proposals: router({
    list: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) return [];
      return db.getProposals(ctx.user.id);
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
        if (!ctx.user) throw new Error("Not authenticated");
        return db.createProposal({
          userId: ctx.user.id,
          ...input,
        });
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
        if (!ctx.user) throw new Error("Not authenticated");
        return db.createLineItem({
          userId: ctx.user.id,
          ...input,
        });
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
    create: publicProcedure
      .input(
        z.object({
          plan: z.enum(["monthly", "lifetime"]),
          stripeCustomerId: z.string().optional(),
          stripeSubscriptionId: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Not authenticated");
        return db.createSubscription({
          userId: ctx.user.id,
          ...input,
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
        if (!ctx.user) throw new Error("Not authenticated");
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
});

export type AppRouter = typeof appRouter;
