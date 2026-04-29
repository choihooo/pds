"use client";

import { useState } from "react";
import { createPlanItem, togglePlanItem, removePlanItem, createTimeBlock } from "@/lib/actions";

const COLORS = ["#4a5568", "#5a7a6b", "#7a6b5a", "#5a6b7a", "#6b5a7a", "#7a5a6b"];

interface PlanItemData {
  id: string;
  text: string;
  done: boolean;
  sortOrder: number;
}

interface PlanKanbanProps {
  date: string;
  initialItems: PlanItemData[];
  onBlockCreated?: () => void;
}

export default function PlanKanban({ date, initialItems, onBlockCreated }: PlanKanbanProps) {
  const [items, setItems] = useState(initialItems);
  const [newText, setNewText] = useState("");

  const addItem = async () => {
    if (!newText.trim()) return;
    const order = items.length;
    const result = await createPlanItem(date, newText.trim(), order);
    if (result[0]) {
      setItems([...items, result[0] as PlanItemData]);
    }
    setNewText("");
  };

  const toggle = async (id: string, done: boolean) => {
    await togglePlanItem(id, !done);
    setItems(items.map((i) => (i.id === id ? { ...i, done: !done } : i)));
  };

  const remove = async (id: string) => {
    await removePlanItem(id);
    setItems(items.filter((i) => i.id !== id));
  };

  const assignTime = async (item: PlanItemData) => {
    const start = prompt("시작 시간 (HH:MM)", "09:00");
    if (!start) return;
    const dur = prompt("소요 시간 (분)", "30");
    if (!dur) return;

    const [h, m] = start.split(":").map(Number);
    const endMin = h * 60 + m + parseInt(dur);
    const endTime = `${String(Math.floor(endMin / 60)).padStart(2, "0")}:${String(endMin % 60).padStart(2, "0")}`;
    const color = COLORS[items.indexOf(item) % COLORS.length];

    await createTimeBlock({
      id: crypto.randomUUID(),
      date,
      title: item.text,
      startTime: `${date}T${start}:00`,
      endTime: `${date}T${endTime}:00`,
      color,
    });
    onBlockCreated?.();
  };

  return (
    <div className="flex h-full flex-col border-r border-gray-200 bg-white">
      <div className="flex-shrink-0 border-b border-gray-200 px-5 py-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Plan</h2>
        <p className="mt-0.5 text-[11px] text-gray-300">할 일을 추가하고 시간을 지정하세요</p>
      </div>

      <div className="flex-1 overflow-y-auto p-2.5">
        {items.map((item) => (
          <div
            key={item.id}
            className="group mb-1.5 flex items-center gap-2.5 rounded-lg bg-gray-50 px-3.5 py-2.5 transition-colors hover:border-gray-200"
          >
            <button
              onClick={() => toggle(item.id, item.done)}
              className={`flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded border-2 text-[11px] text-white ${
                item.done ? "border-gray-600 bg-gray-600" : "border-gray-300 bg-transparent"
              }`}
            >
              {item.done && "✓"}
            </button>
            <span
              className={`flex-1 text-sm ${
                item.done ? "text-gray-300 line-through" : "text-gray-700"
              }`}
            >
              {item.text}
            </span>
            <button
              onClick={() => assignTime(item)}
              className="cursor-pointer rounded bg-gray-100 px-2 py-0.5 text-[11px] text-gray-400 opacity-0 transition-opacity hover:bg-gray-200 group-hover:opacity-100"
            >
              + 시간
            </button>
            <button
              onClick={() => remove(item.id)}
              className="cursor-pointer px-1 text-gray-300 opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-shrink-0 items-center gap-2 border-t border-gray-200 px-3.5 py-2.5">
        <input
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addItem()}
          placeholder="+ 항목 추가"
          className="flex-1 bg-transparent text-sm text-gray-600 outline-none placeholder:text-gray-300"
        />
        {newText.trim() && (
          <button
            onClick={addItem}
            className="rounded bg-gray-600 px-3 py-1 text-xs text-white"
          >
            추가
          </button>
        )}
      </div>
    </div>
  );
}
