import { eq } from "drizzle-orm";
import { getDb } from "./index";
import { dailyEntries, planItems, timeBlocks } from "./schema";

// Daily entries
export async function getEntry(date: string) {
  const rows = await getDb()
    .select()
    .from(dailyEntries)
    .where(eq(dailyEntries.date, date));
  return rows[0] ?? null;
}

export async function upsertEntry(data: {
  date: string;
  mood?: number | null;
  energy?: number | null;
  focus?: number | null;
  goodText?: string;
  improveText?: string;
  thanksText?: string;
}) {
  return getDb()
    .insert(dailyEntries)
    .values({
      date: data.date,
      mood: data.mood ?? null,
      energy: data.energy ?? null,
      focus: data.focus ?? null,
      goodText: data.goodText ?? "",
      improveText: data.improveText ?? "",
      thanksText: data.thanksText ?? "",
      updatedAt: new Date().toISOString(),
    })
    .onConflictDoUpdate({
      target: dailyEntries.date,
      set: {
        ...(data.mood !== undefined && { mood: data.mood }),
        ...(data.energy !== undefined && { energy: data.energy }),
        ...(data.focus !== undefined && { focus: data.focus }),
        ...(data.goodText !== undefined && { goodText: data.goodText }),
        ...(data.improveText !== undefined && { improveText: data.improveText }),
        ...(data.thanksText !== undefined && { thanksText: data.thanksText }),
        updatedAt: new Date().toISOString(),
      },
    })
    .returning();
}

// Plan items
export async function getPlanItems(date: string) {
  return getDb()
    .select()
    .from(planItems)
    .where(eq(planItems.date, date))
    .orderBy(planItems.sortOrder);
}

export async function addPlanItem(date: string, text: string, sortOrder: number) {
  return getDb()
    .insert(planItems)
    .values({ id: crypto.randomUUID(), date, text, sortOrder })
    .returning();
}

export async function updatePlanItem(id: string, data: { text?: string; done?: boolean; sortOrder?: number }) {
  return getDb()
    .update(planItems)
    .set(data)
    .where(eq(planItems.id, id))
    .returning();
}

export async function deletePlanItem(id: string) {
  return getDb().delete(planItems).where(eq(planItems.id, id));
}

// Time blocks
export async function getTimeBlocks(date: string) {
  return getDb()
    .select()
    .from(timeBlocks)
    .where(eq(timeBlocks.date, date))
    .orderBy(timeBlocks.startTime);
}

export async function addTimeBlock(block: { id: string; date: string; title: string; startTime: string; endTime: string; color: string }) {
  return getDb()
    .insert(timeBlocks)
    .values(block)
    .returning();
}

export async function updateTimeBlock(id: string, data: { title?: string; startTime?: string; endTime?: string; color?: string }) {
  return getDb()
    .update(timeBlocks)
    .set(data)
    .where(eq(timeBlocks.id, id))
    .returning();
}

export async function deleteTimeBlock(id: string) {
  return getDb().delete(timeBlocks).where(eq(timeBlocks.id, id));
}
