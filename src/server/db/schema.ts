// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { index, pgTableCreator } from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `TIC_${name}`);

export const applications = createTable(
  "application",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    name: d.varchar({ length: 256 }).notNull(),
    email: d.varchar({ length: 256 }).notNull(),
    mobileNumber: d.varchar({ length: 50 }).notNull(),
    startupName: d.varchar({ length: 256 }).notNull(),
    website: d.varchar({ length: 256 }),
    pitchDeck: d.varchar({ length: 256 }),
    overview: d.text().notNull(),
    founderStage: d.varchar({ length: 100 }).notNull(),
    primaryGoal: d.varchar({ length: 256 }).notNull(),
    monthlyRevenue: d.varchar({ length: 100 }),
    tier: d.varchar({ length: 50 }).notNull(), // Explorer, Visionary, Trailblazer
    status: d.varchar({ length: 50 }).default("pending").notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [index("email_idx").on(t.email)],
);
