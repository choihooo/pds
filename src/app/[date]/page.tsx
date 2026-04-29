import { notFound } from "next/navigation";
import { fetchDailyEntry, fetchPlanItems, fetchTimeBlocks } from "@/lib/actions";
import DailyPageClient from "./daily-page-client";

interface PageProps {
  params: Promise<{ date: string }>;
}

function isValidDate(d: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(d) && !isNaN(new Date(d + "T00:00:00").getTime());
}

export default async function DailyPage({ params }: PageProps) {
  const { date } = await params;
  if (!isValidDate(date)) notFound();

  const [entry, planItemsData, timeBlocksData] = await Promise.all([
    fetchDailyEntry(date),
    fetchPlanItems(date),
    fetchTimeBlocks(date),
  ]);

  return (
    <DailyPageClient
      date={date}
      mood={entry?.mood ?? null}
      energy={entry?.energy ?? null}
      focus={entry?.focus ?? null}
      goodText={entry?.goodText ?? ""}
      improveText={entry?.improveText ?? ""}
      thanksText={entry?.thanksText ?? ""}
      planItems={planItemsData}
      timeBlocks={timeBlocksData}
    />
  );
}
