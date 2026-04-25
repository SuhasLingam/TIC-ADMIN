// Admin Schema — mirrors TIC production tables
import { index, pgTableCreator } from "drizzle-orm/pg-core";

export const createTable = pgTableCreator((name) => `TIC_${name}`);

// ─── APPLICATIONS ────────────────────────────────────────────────────────────
export const applications = createTable(
  "application",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    token: d.uuid().notNull().defaultRandom(),
    name: d.varchar({ length: 256 }),
    email: d.varchar({ length: 256 }).notNull(),
    companyName: d.varchar({ length: 256 }),
    website: d.varchar({ length: 256 }),
    role: d.varchar({ length: 150 }),
    startupStage: d.varchar({ length: 150 }),
    buildingContext: d.text(),
    currentChallenge: d.text(),
    traction: d.varchar({ length: 150 }),
    teamSize: d.varchar({ length: 50 }),
    whyTic: d.text(),
    tierInterest: d.varchar({ length: 50 }),
    icpScore: d.integer(),
    assignedTier: d.varchar({ length: 50 }),
    status: d.varchar({ length: 50 }).default("draft").notNull(),
    createdAt: d.timestamp({ withTimezone: true }).$defaultFn(() => new Date()).notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("application_email_idx").on(t.email),
    index("application_token_idx").on(t.token),
  ],
);

// ─── PROFILES ────────────────────────────────────────────────────────────────
export const profiles = createTable(
  "profile",
  (d) => ({
    id: d.uuid().primaryKey(),
    email: d.varchar({ length: 256 }).notNull(),
    fullName: d.varchar({ length: 256 }).notNull(),
    tier: d.varchar({ length: 50 }),
    role: d.varchar({ length: 150 }).default("founder"),
    companyName: d.varchar({ length: 256 }),
    startupStage: d.varchar({ length: 150 }),
    mainGoal: d.text(),
    whyTic: d.text(),
    internalNotes: d.text(),
    selectedCardId: d.varchar({ length: 256 }),
    paymentStatus: d.varchar({ length: 50 }).default("pending").notNull(),
    onboardingStep: d.integer().default(0),
    createdAt: d.timestamp({ withTimezone: true }).$defaultFn(() => new Date()).notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [index("profile_email_idx").on(t.email)],
);

// ─── STARTUPS ────────────────────────────────────────────────────────────────
export const startups = createTable(
  "startup",
  (d) => ({
    id: d.uuid().defaultRandom().primaryKey(),
    profileId: d.uuid().references(() => profiles.id).notNull(),
    name: d.varchar({ length: 256 }).notNull(),
    stageDeclared: d.varchar({ length: 100 }),
    stageDetected: d.varchar({ length: 100 }),
    industry: d.varchar({ length: 150 }),
    description: d.text(),
    createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
  }),
  (t) => [index("startup_profile_id_idx").on(t.profileId)],
);

// ─── INTAKE RESPONSES ────────────────────────────────────────────────────────
export const intakeResponses = createTable(
  "intake_response",
  (d) => ({
    id: d.uuid().defaultRandom().primaryKey(),
    profileId: d.uuid().references(() => profiles.id).notNull(),
    startupId: d.uuid().references(() => startups.id),
    questionKey: d.varchar({ length: 100 }).notNull(),
    answerText: d.text().notNull(),
    createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
  }),
  (t) => [index("intake_profile_id_idx").on(t.profileId)],
);

// ─── DERIVED INTELLIGENCE ─────────────────────────────────────────────────────
export const derivedIntelligence = createTable(
  "derived_intelligence",
  (d) => ({
    id: d.uuid().defaultRandom().primaryKey(),
    profileId: d.uuid().references(() => profiles.id).notNull().unique(),
    stageDetected: d.varchar({ length: 100 }),
    problemType: d.varchar({ length: 100 }), // ICP | PRODUCT | GTM
    clarityScore: d.integer().default(0),
    urgencyScore: d.integer().default(0),
    priorityFocus: d.text(),
    confidenceScore: d.integer().default(0),
    keyBlocker: d.text(),
    lastUpdated: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
  }),
  (t) => [index("intelligence_profile_id_idx").on(t.profileId)],
);

// ─── EXECUTION PLANS ─────────────────────────────────────────────────────────
export const executionPlans = createTable(
  "execution_plan",
  (d) => ({
    id: d.uuid().defaultRandom().primaryKey(),
    profileId: d.uuid().references(() => profiles.id).notNull(),
    primaryGoal: d.text().notNull(),
    planVersion: d.integer().default(1).notNull(),
    isActive: d.boolean().default(true).notNull(),
    createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
  }),
  (t) => [index("plan_profile_id_idx").on(t.profileId)],
);

// ─── TASKS ───────────────────────────────────────────────────────────────────
export const tasks = createTable(
  "task",
  (d) => ({
    id: d.uuid().defaultRandom().primaryKey(),
    profileId: d.uuid().references(() => profiles.id).notNull(),
    planId: d.uuid().references(() => executionPlans.id),
    title: d.varchar({ length: 256 }).notNull(),
    description: d.text(),
    category: d.varchar({ length: 100 }),
    type: d.varchar({ length: 50 }).default("execution"), // validation | product | gtm | execution
    status: d.varchar({ length: 50 }).default("todo").notNull(),
    priority: d.varchar({ length: 50 }).default("medium").notNull(),
    orderIndex: d.integer().default(0),
    dueDate: d.timestamp({ withTimezone: true }),
    createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [index("task_profile_id_idx").on(t.profileId)],
);

// ─── TASK EVENTS ─────────────────────────────────────────────────────────────
export const taskEvents = createTable(
  "task_event",
  (d) => ({
    id: d.uuid().defaultRandom().primaryKey(),
    taskId: d.uuid().references(() => tasks.id).notNull(),
    action: d.varchar({ length: 50 }).notNull(), // created | started | completed
    timestamp: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
  }),
  (t) => [index("task_event_task_id_idx").on(t.taskId)],
);

// ─── MILESTONES ───────────────────────────────────────────────────────────────
export const milestones = createTable(
  "milestone",
  (d) => ({
    id: d.uuid().defaultRandom().primaryKey(),
    profileId: d.uuid().references(() => profiles.id).notNull(),
    key: d.varchar({ length: 100 }).notNull(),
    label: d.varchar({ length: 256 }).notNull(),
    completedAt: d.timestamp({ withTimezone: true }),
    createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
  }),
  (t) => [index("milestone_profile_id_idx").on(t.profileId)],
);

// ─── RECOMMENDATIONS ─────────────────────────────────────────────────────────
export const recommendations = createTable(
  "recommendation",
  (d) => ({
    id: d.uuid().defaultRandom().primaryKey(),
    profileId: d.uuid().references(() => profiles.id).notNull(),
    type: d.varchar({ length: 50 }).notNull(), // event | founder | strategy | hackathon
    referenceId: d.uuid(),
    title: d.varchar({ length: 256 }).notNull(),
    reason: d.text(),
    relevanceScore: d.integer().default(50),
    dismissed: d.boolean().default(false),
    createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
  }),
  (t) => [index("recommendation_profile_id_idx").on(t.profileId)],
);

// ─── NETWORK GRAPH ───────────────────────────────────────────────────────────
export const networkGraph = createTable(
  "network_graph",
  (d) => ({
    id: d.uuid().defaultRandom().primaryKey(),
    profileId: d.uuid().references(() => profiles.id).notNull(),
    connectedProfileId: d.uuid().references(() => profiles.id).notNull(),
    relationType: d.varchar({ length: 100 }),
    strengthScore: d.integer().default(50),
    createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
  }),
  (t) => [index("network_graph_profile_id_idx").on(t.profileId)],
);

// ─── OPPORTUNITIES ────────────────────────────────────────────────────────────
export const opportunities = createTable(
  "opportunity",
  (d) => ({
    id: d.uuid().defaultRandom().primaryKey(),
    type: d.varchar({ length: 100 }).notNull(), // hackathon | internal_event | collaboration
    title: d.varchar({ length: 256 }).notNull(),
    description: d.text(),
    tags: d.text(),
    eligibilityRules: d.text(),
    startDate: d.timestamp({ withTimezone: true }),
    endDate: d.timestamp({ withTimezone: true }),
    status: d.varchar({ length: 50 }).default("active").notNull(),
    createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
  })
);

// ─── EVENTS ──────────────────────────────────────────────────────────────────
export const events = createTable(
  "event",
  (d) => ({
    id: d.uuid().defaultRandom().primaryKey(),
    name: d.varchar({ length: 256 }).notNull(),
    purpose: d.text().notNull(),
    date: d.timestamp({ withTimezone: true }).notNull(),
    format: d.varchar({ length: 100 }).notNull(),
    accessLevel: d.varchar({ length: 100 }).notNull(),
    status: d.varchar({ length: 50 }).default("upcoming").notNull(),
    createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
  })
);

// ─── INSIGHTS ────────────────────────────────────────────────────────────────
export const insights = createTable(
  "insight",
  (d) => ({
    id: d.uuid().defaultRandom().primaryKey(),
    title: d.varchar({ length: 256 }).notNull(),
    type: d.varchar({ length: 100 }).notNull(),
    summary: d.text(),
    readTime: d.varchar({ length: 50 }),
    date: d.varchar({ length: 100 }).notNull(),
    contentUrl: d.text(),
    tierRequired: d.varchar({ length: 50 }).notNull(),
    createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
  })
);

// ─── DELIVERABLES ────────────────────────────────────────────────────────────
export const deliverables = createTable(
  "deliverable",
  (d) => ({
    id: d.uuid().defaultRandom().primaryKey(),
    profileId: d.uuid().references(() => profiles.id).notNull(),
    title: d.varchar({ length: 256 }).notNull(),
    description: d.text(),
    status: d.varchar({ length: 50 }).notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
  }),
  (t) => [index("deliverable_profile_id_idx").on(t.profileId)],
);
