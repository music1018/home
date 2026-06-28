import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const likes = sqliteTable('likes', {
  slug: text('slug').primaryKey(),
  count: integer('count').notNull().default(0),
  updatedAt: text('updated_at').notNull(),
});

export const comments = sqliteTable('comments', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull(),
  author: text('author').notNull().default('匿名'),
  content: text('content').notNull(),
  createdAt: text('created_at').notNull(),
});
