import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const dailyEntries = sqliteTable("daily_entries", {
  date: text("date").primaryKey(),
  mood: integer("mood"),
  energy: integer("energy"),
  focus: integer("focus"),
  goodText: text("good_text").notNull().default(""),
  improveText: text("improve_text").notNull().default(""),
  thanksText: text("thanks_text").notNull().default(""),
  userId: text("user_id").notNull().default("owner"),
  createdAt: text("created_at")
    .notNull()
    .default("(datetime('now'))"),
  updatedAt: text("updated_at")
    .notNull()
    .default("(datetime('now'))"),
});

export const planItems = sqliteTable("plan_items", {
  id: text("id").primaryKey(),
  date: text("date").notNull(),
  text: text("text").notNull(),
  done: integer("done", { mode: "boolean" }).notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at")
    .notNull()
    .default("(datetime('now'))"),
});

export const timeBlocks = sqliteTable("time_blocks", {
  id: text("id").primaryKey(),
  date: text("date").notNull(),
  title: text("title").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  color: text("color").notNull().default("#4a5568"),
  createdAt: text("created_at")
    .notNull()
    .default("(datetime('now'))"),
});
