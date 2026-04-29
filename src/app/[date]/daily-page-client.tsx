"use client";

import { useState, useCallback } from "react";
import DateNav from "@/components/layout/date-nav";
import MoodSelector from "@/components/daily/mood-selector";
import PlanKanban from "@/components/daily/plan-kanban";
import DoTimetable from "@/components/daily/do-timetable";
import SeeSection from "@/components/daily/see-section";

interface PlanItemData {
  id: string;
  text: string;
  done: boolean;
  sortOrder: number;
}

interface TimeBlockData {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  color: string;
}

interface DailyPageClientProps {
  date: string;
  mood: number | null;
  energy: number | null;
  focus: number | null;
  goodText: string;
  improveText: string;
  thanksText: string;
  planItems: PlanItemData[];
  timeBlocks: TimeBlockData[];
}

export default function DailyPageClient({
  date,
  mood,
  energy,
  focus,
  goodText,
  improveText,
  thanksText,
  planItems,
  timeBlocks,
}: DailyPageClientProps) {
  const [blockRefresh, setBlockRefresh] = useState(0);

  const handleBlockCreated = useCallback(() => {
    setBlockRefresh((k) => k + 1);
  }, []);

  return (
    <div className="flex h-screen flex-col bg-[#f8f8f6]">
      {/* Header */}
      <header className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 py-2.5">
        <DateNav date={date} />
        <MoodSelector
          date={date}
          initialMood={mood}
          initialEnergy={energy}
          initialFocus={focus}
        />
      </header>

      {/* Upper: Plan | Do */}
      <div className="grid flex-[3] min-h-0 grid-cols-[300px_1fr] overflow-hidden border-b-2 border-gray-200">
        <PlanKanban
          date={date}
          initialItems={planItems}
          onBlockCreated={handleBlockCreated}
        />
        <DoTimetable
          key={blockRefresh}
          date={date}
          initialBlocks={timeBlocks}
          refreshKey={blockRefresh}
        />
      </div>

      {/* See: Bottom */}
      <SeeSection
        date={date}
        initialGood={goodText}
        initialImprove={improveText}
        initialThanks={thanksText}
      />
    </div>
  );
}
