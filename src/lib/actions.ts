"use server";

import {
  getEntry,
  upsertEntry,
  getPlanItems,
  addPlanItem,
  updatePlanItem,
  deletePlanItem,
  getTimeBlocks,
  addTimeBlock,
  updateTimeBlock,
  deleteTimeBlock,
} from "./db/queries";

// Daily entry
export async function fetchDailyEntry(date: string) {
  return getEntry(date);
}

export async function saveMood(date: string, type: "mood" | "energy" | "focus", value: number | null) {
  return upsertEntry({ date, [type]: value });
}

export async function saveSeeSection(
  date: string,
  field: "goodText" | "improveText" | "thanksText",
  value: string,
) {
  return upsertEntry({ date, [field]: value });
}

// Plan items
export async function fetchPlanItems(date: string) {
  return getPlanItems(date);
}

export async function createPlanItem(date: string, text: string, sortOrder: number) {
  return addPlanItem(date, text, sortOrder);
}

export async function togglePlanItem(id: string, done: boolean) {
  return updatePlanItem(id, { done });
}

export async function removePlanItem(id: string) {
  return deletePlanItem(id);
}

// Time blocks
export async function fetchTimeBlocks(date: string) {
  return getTimeBlocks(date);
}

export async function createTimeBlock(block: { id: string; date: string; title: string; startTime: string; endTime: string; color: string }) {
  return addTimeBlock(block);
}

export async function editTimeBlock(id: string, data: { title?: string; startTime?: string; endTime?: string; color?: string }) {
  return updateTimeBlock(id, data);
}

export async function removeTimeBlock(id: string) {
  return deleteTimeBlock(id);
}
