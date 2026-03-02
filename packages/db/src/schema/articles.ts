import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { workspaces } from './workspaces';
import { collections } from './collections';
import { customType } from 'drizzle-orm/pg-core';

// Custom tsvector type
const tsvector = customType<{ data: string }>({
  dataType() {
    return 'tsvector';
  },
});

export const articleStatusEnum = pgEnum('article_status', ['draft', 'published']);

export const articles = pgTable(
  'articles',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    collectionId: uuid('collection_id').references(() => collections.id, {
      onDelete: 'set null',
    }),
    title: varchar('title', { length: 500 }).notNull(),
    contentMd: text('content_md').notNull().default(''),
    slug: varchar('slug', { length: 600 }).notNull(),
    status: articleStatusEnum('status').default('draft').notNull(),
    position: integer('position').default(0).notNull(),
    searchVector: tsvector('search_vector'),
    publishedAt: timestamp('published_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    searchVectorIdx: index('articles_search_vector_idx').using(
      'gin',
      sql`${table.searchVector}`
    ),
  })
);

export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;
