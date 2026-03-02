import { pgTable, uuid, varchar, integer, timestamp } from 'drizzle-orm/pg-core';
import { workspaces } from './workspaces';

export const collections = pgTable('collections', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: varchar('description', { length: 1000 }),
  icon: varchar('icon', { length: 10 }),
  color: varchar('color', { length: 20 }),
  position: integer('position').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Collection = typeof collections.$inferSelect;
export type NewCollection = typeof collections.$inferInsert;
