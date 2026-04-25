import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  events, insights, opportunities, deliverables, profiles, recommendations, tasks, milestones
} from "~/server/db/schema";
import { eq, desc, and } from "drizzle-orm";

import type { db as database } from "~/server/db";

// ─── Helper: resolve target profileIds ───────────────────────────────────────
// ... [rest of helper stays same] ...
// target: "all" | tier name | specific profileId UUID
async function resolveTargets(ctx: { db: typeof database }, target: string): Promise<string[]> {
  if (target === "all") {
    const all = await ctx.db.query.profiles.findMany();
    return all.map((p: { id: string }) => p.id);
  }

  // If it looks like a UUID — single user
  if (/^[0-9a-f-]{36}$/i.test(target)) return [target];

  // Otherwise treat as tier name
  const byTier = await ctx.db.query.profiles.findMany({
    where: eq(profiles.tier, target),
  });
  return byTier.map((p: { id: string }) => p.id);
}

export const broadcastRouter = createTRPCRouter({

  // ─── EVENTS ─────────────────────────────────────────────────────────────────
  getEvents: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.events.findMany({ orderBy: [desc(events.createdAt)] });
  }),

  createEvent: publicProcedure
    .input(z.object({
      name: z.string().min(1),
      purpose: z.string().min(1),
      date: z.string(), // ISO string
      format: z.string(),
      accessLevel: z.enum(["All Members", "Explorer", "Visionary", "Trailblazer"]),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(events).values({
        name: input.name,
        purpose: input.purpose,
        date: new Date(input.date),
        format: input.format,
        accessLevel: input.accessLevel,
        status: "upcoming",
      });
      return { success: true };
    }),

  deleteEvent: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(events).where(eq(events.id, input.id));
      return { success: true };
    }),

  // ─── INSIGHTS ────────────────────────────────────────────────────────────────
  getInsights: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.insights.findMany({ orderBy: [desc(insights.createdAt)] });
  }),

  createInsight: publicProcedure
    .input(z.object({
      title: z.string().min(1),
      type: z.string().min(1),
      summary: z.string().optional(),
      readTime: z.string().optional(),
      date: z.string(),
      contentUrl: z.string().optional(),
      tierRequired: z.enum(["All", "Explorer", "Visionary", "Trailblazer"]),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(insights).values({
        title: input.title,
        type: input.type,
        summary: input.summary ?? null,
        readTime: input.readTime ?? null,
        date: input.date,
        contentUrl: input.contentUrl ?? null,
        tierRequired: input.tierRequired,
      });
      return { success: true };
    }),

  deleteInsight: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(insights).where(eq(insights.id, input.id));
      return { success: true };
    }),

  // ─── OPPORTUNITIES ────────────────────────────────────────────────────────────
  getOpportunities: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.opportunities.findMany({ orderBy: [desc(opportunities.createdAt)] });
  }),

  createOpportunity: publicProcedure
    .input(z.object({
      type: z.enum(["hackathon", "internal_event", "collaboration"]),
      title: z.string().min(1),
      description: z.string().optional(),
      tags: z.array(z.string()).optional(),
      eligibilityTiers: z.array(z.string()).optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(opportunities).values({
        type: input.type,
        title: input.title,
        description: input.description ?? null,
        tags: input.tags ? JSON.stringify(input.tags) : null,
        eligibilityRules: input.eligibilityTiers ? JSON.stringify({ tiers: input.eligibilityTiers }) : null,
        startDate: input.startDate ? new Date(input.startDate) : null,
        endDate: input.endDate ? new Date(input.endDate) : null,
        status: "active",
      });
      return { success: true };
    }),

  deleteOpportunity: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(opportunities).where(eq(opportunities.id, input.id));
      return { success: true };
    }),

  // ─── DELIVERABLES (targeted broadcast) ────────────────────────────────────────
  // target: "all" | tier name (Explorer/Visionary/Trailblazer) | specific UUID
  broadcastDeliverable: publicProcedure
    .input(z.object({
      target: z.string(), // "all" | "Explorer" | "Visionary" | "Trailblazer" | UUID
      title: z.string().min(1),
      description: z.string().optional(),
      status: z.enum(["available", "scheduled", "in-progress", "active"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const profileIds = await resolveTargets(ctx, input.target);
      if (profileIds.length === 0) return { success: true, count: 0 };

      await ctx.db.insert(deliverables).values(
        profileIds.map((id) => ({
          profileId: id,
          title: input.title,
          description: input.description ?? null,
          status: input.status,
        }))
      );
      return { success: true, count: profileIds.length };
    }),

  getDeliverables: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.deliverables.findMany({
      orderBy: [desc(deliverables.updatedAt)],
    });
  }),

  deleteDeliverable: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(deliverables).where(eq(deliverables.id, input.id));
      return { success: true };
    }),

  // ─── MEMBERS list (for targeting UI) ─────────────────────────────────────
  getMembers: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.profiles.findMany({
      orderBy: [desc(profiles.createdAt)],
    });
  }),

  // ─── RECOMMENDATIONS (network / strategy / event suggestions per user) ────
  broadcastRecommendation: publicProcedure
    .input(z.object({
      target: z.string(), // "all" | tier | UUID
      type: z.enum(["event", "founder", "strategy", "hackathon", "mentor", "peer", "co-founder", "collaborator"]),
      title: z.string().min(1),
      reason: z.string().optional(),
      relevanceScore: z.number().min(0).max(100).default(50),
    }))
    .mutation(async ({ ctx, input }) => {
      const profileIds = await resolveTargets(ctx, input.target);
      if (profileIds.length === 0) return { success: true, count: 0 };

      await ctx.db.insert(recommendations).values(
        profileIds.map((id) => ({
          profileId: id,
          type: input.type,
          title: input.title,
          reason: input.reason ?? null,
          relevanceScore: input.relevanceScore,
          dismissed: false,
        }))
      );
      return { success: true, count: profileIds.length };
    }),

  getRecommendations: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.recommendations.findMany({
      orderBy: [desc(recommendations.createdAt)],
    });
  }),

  deleteRecommendation: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(recommendations).where(eq(recommendations.id, input.id));
      return { success: true };
    }),

  // ─── TASKS (targeted broadcast) ───────────────────────────────────────────
  broadcastTask: publicProcedure
    .input(z.object({
      target: z.string(), // "all" | tier | UUID
      title: z.string().min(1),
      description: z.string().optional(),
      category: z.string().default("General"),
      priority: z.enum(["low", "medium", "high"]).default("medium"),
      type: z.enum(["validation", "product", "gtm", "execution"]).default("execution"),
    }))
    .mutation(async ({ ctx, input }) => {
      const profileIds = await resolveTargets(ctx, input.target);
      if (profileIds.length === 0) return { success: true, count: 0 };

      await ctx.db.insert(tasks).values(
        profileIds.map((id) => ({
          profileId: id,
          title: input.title,
          description: input.description ?? null,
          category: input.category,
          priority: input.priority,
          type: input.type,
          status: "todo",
        }))
      );
      return { success: true, count: profileIds.length };
    }),

  // ─── MILESTONES ───────────────────────────────────────────────────────────
  getMemberMilestones: publicProcedure
    .input(z.object({ profileId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.milestones.findMany({
        where: eq(milestones.profileId, input.profileId),
      });
    }),

  completeMilestone: publicProcedure
    .input(z.object({ 
      profileId: z.string().uuid(), 
      key: z.string(),
      completed: z.boolean()
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.update(milestones)
        .set({ completedAt: input.completed ? new Date() : null })
        .where(and(
          eq(milestones.profileId, input.profileId),
          eq(milestones.key, input.key)
        ));
    }),
  
  updateMemberNotes: publicProcedure
    .input(z.object({
      profileId: z.string().uuid(),
      notes: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.update(profiles)
        .set({ internalNotes: input.notes })
        .where(eq(profiles.id, input.profileId));
      return { success: true };
    }),
});
