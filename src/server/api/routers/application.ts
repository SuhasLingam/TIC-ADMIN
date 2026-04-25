import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { applications } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import {
    sendReviewEmail,
    sendDecisionEmail,
    sendCustomEmail,
} from "~/server/mail";

export const applicationRouter = createTRPCRouter({
    // Get all applications ordered by newest first
    getAll: publicProcedure.query(async ({ ctx }) => {
        return ctx.db.query.applications.findMany({
            orderBy: (applications, { desc }) => [desc(applications.createdAt)],
            limit: 500, // Safety cap — add pagination if this is exceeded
        });
    }),

    // Get a specific application by ID
    getById: publicProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ ctx, input }) => {
            const app = await ctx.db.query.applications.findFirst({
                where: eq(applications.id, input.id),
            });
            return app ?? null;
        }),

    updateStatus: publicProcedure
        .input(z.object({
            id: z.number(),
            status: z.string(),
            assignedTier: z.string().optional(),
            icpScore: z.number().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            await ctx.db
                .update(applications)
                .set({
                    status: input.status,
                    ...(input.assignedTier && { assignedTier: input.assignedTier }),
                    ...(input.icpScore !== undefined && { icpScore: input.icpScore }),
                })
                .where(eq(applications.id, input.id));
            return { success: true };
        }),

    // Send "Under Review" email to applicant
    sendReviewEmail: publicProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ ctx, input }) => {
            const app = await ctx.db.query.applications.findFirst({
                where: eq(applications.id, input.id),
            });
            if (!app) throw new Error("Application not found");

            await sendReviewEmail({ name: app.name ?? "Founder", email: app.email, tier: app.assignedTier ?? app.tierInterest ?? "Explorer" });

            // Update status to reviewed
            await ctx.db
                .update(applications)
                .set({ status: "reviewed" })
                .where(eq(applications.id, input.id));

            return { success: true };
        }),

    // Send acceptance email to applicant
    sendAcceptanceEmail: publicProcedure
        .input(z.object({
            id: z.number(),
            calendlyLink: z.string().optional(),
            assignedTier: z.string().optional(),
            icpScore: z.number().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const app = await ctx.db.query.applications.findFirst({
                where: eq(applications.id, input.id),
            });
            if (!app) throw new Error("Application not found");

            const finalTier = input.assignedTier ?? app.assignedTier ?? app.tierInterest ?? "Explorer";

            await sendDecisionEmail({
                name: app.name ?? "Founder",
                email: app.email,
                tier: finalTier,
                decision: "accepted",
                calendlyLink: input.calendlyLink,
                activationUrl: `${process.env.TIC_APP_URL ?? "http://localhost:3000"}/activate-membership?email=${encodeURIComponent(app.email)}&tier=${encodeURIComponent(finalTier)}`,
            });

            // Update status to approved
            await ctx.db
                .update(applications)
                .set({
                    status: "approved",
                    ...(input.assignedTier && { assignedTier: input.assignedTier }),
                    ...(input.icpScore !== undefined && { icpScore: input.icpScore }),
                })
                .where(eq(applications.id, input.id));

            return { success: true };
        }),

    // Send rejection email to applicant
    sendRejectionEmail: publicProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ ctx, input }) => {
            const app = await ctx.db.query.applications.findFirst({
                where: eq(applications.id, input.id),
            });
            if (!app) throw new Error("Application not found");

            await sendDecisionEmail({
                name: app.name ?? "Founder",
                email: app.email,
                tier: app.assignedTier ?? app.tierInterest ?? "Explorer",
                decision: "rejected",
            });

            // Update status to rejected
            await ctx.db
                .update(applications)
                .set({ status: "rejected" })
                .where(eq(applications.id, input.id));

            return { success: true };
        }),

    // Send a custom email composed by the admin
    sendCustomEmail: publicProcedure
        .input(z.object({ id: z.number(), subject: z.string().min(1), body: z.string().min(1) }))
        .mutation(async ({ ctx, input }) => {
            const app = await ctx.db.query.applications.findFirst({
                where: eq(applications.id, input.id),
            });
            if (!app) throw new Error("Application not found");

            await sendCustomEmail({
                name: app.name ?? "Founder",
                email: app.email,
                subject: input.subject,
                body: input.body,
            });

            return { success: true };
        }),
});
