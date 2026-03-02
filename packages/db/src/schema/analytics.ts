import { pgTable, uuid, varchar, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { workspaces } from './workspaces';
import { articles } from './articles';

export const analyticsEventTypeEnum = pgEnum('analytics_event_type', [
  'article_viewed',
  'search_performed',
  'widget_opened',
  'article_helpful',
  'article_not_helpful',
]);

export const analyticsEvents = pgTable('analytics_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id')
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  articleId: uuid('article_id').references(() => articles.id, { onDelete: 'set null' }),
  event: analyticsEventTypeEnum('event').notNull(),
  query: varchar('query', { length: 500 }),
  resultsCount: integer('results_count'),
  sessionId: varchar('session_id', { length: 255 }),
  ip: varchar('ip', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type NewAnalyticsEvent = typeof analyticsEvents.$inferInsert;
