"use client";

import { useState, useCallback, useRef } from "react";
import { createTimeBlock, removeTimeBlock, editTimeBlock } from "@/lib/actions";

const COLORS = ["#4a5568", "#5a7a6b", "#7a6b5a", "#5a6b7a", "#6b5a7a", "#7a5a6b"];
const SLOTS_PER_HOUR = 6;
const TOTAL_SLOTS = 24 * SLOTS_PER_HOUR; // 144

interface TimeBlockData {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  color: string;
}

interface DoTimetableProps {
  date: string;
  initialBlocks: TimeBlockData[];
  refreshKey?: number;
}

function parseStartSlot(iso: string) {
  const d = new Date(iso);
  return d.getHours() * 6 + Math.floor(d.getMinutes() / 10);
}

function parseEndSlot(iso: string) {
  const d = new Date(iso);
  return d.getHours() * 6 + Math.ceil(d.getMinutes() / 10);
}

function slotToISO(date: string, slot: number) {
  const h = Math.floor(slot / 6);
  const m = (slot % 6) * 10;
  return `${date}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
}

export default function DoTimetable({ date, initialBlocks, refreshKey }: DoTimetableProps) {
  const [blocks, setBlocks] = useState<TimeBlockData[]>(initialBlocks);
  const dragRef = useRef<{
    blockId: string;
    mode: "move" | "resize";
    startSlot: number;
    originalStart: number;
    originalEnd: number;
  } | null>(null);

  const handleSlotClick = useCallback(
    async (slotIdx: number) => {
      // Check if occupied
      const existing = blocks.find(
        (b) => parseStartSlot(b.startTime) <= slotIdx && parseEndSlot(b.endTime) > slotIdx,
      );
      if (existing) {
        if (confirm(`"${existing.title}" 삭제?`)) {
          await removeTimeBlock(existing.id);
          setBlocks((prev) => prev.filter((b) => b.id !== existing.id));
        }
        return;
      }

      const title = prompt("할 일을 입력하세요");
      if (!title) return;
      const color = COLORS[blocks.length % COLORS.length];
      const id = crypto.randomUUID();
      const startSlot = slotIdx;
      const endSlot = Math.min(slotIdx + 3, TOTAL_SLOTS); // default 30 min

      const startTime = slotToISO(date, startSlot);
      const endTime = slotToISO(date, endSlot);

      await createTimeBlock({ id, date, title, startTime, endTime, color });
      setBlocks((prev) => [...prev, { id, title, startTime, endTime, color }]);
    },
    [date, blocks],
  );

  const handleDragStart = useCallback(
    (block: TimeBlockData, mode: "move" | "resize", e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragRef.current = {
        blockId: block.id,
        mode,
        startSlot: mode === "move"
          ? Math.floor((e.clientY) / 40) * 6 // approximate
          : parseStartSlot(block.startTime),
        originalStart: parseStartSlot(block.startTime),
        originalEnd: parseEndSlot(block.endTime),
      };

      const handleMove = (ev: MouseEvent) => {
        if (!dragRef.current) return;
        // Visual preview handled by state
      };

      const handleUp = async (ev: MouseEvent) => {
        if (!dragRef.current) return;
        const drag = dragRef.current;
        dragRef.current = null;
        document.removeEventListener("mousemove", handleMove);
        document.removeEventListener("mouseup", handleUp);

        // Calculate target slot from mouse position relative to table
        const table = document.querySelector("[data-timetable]");
        if (!table) return;
        const rect = table.getBoundingClientRect();
        const rowHeight = rect.height / 24;
        const colWidth = (rect.width - 44) / 6;
        const y = ev.clientY - rect.top;
        const x = ev.clientX - rect.left - 44;

        if (x < 0 || y < 0) return;

        const targetHour = Math.min(23, Math.max(0, Math.floor(y / rowHeight)));
        const targetSlotInHour = Math.min(5, Math.max(0, Math.floor(x / colWidth)));
        const targetSlot = targetHour * 6 + targetSlotInHour;

        const { originalStart, originalEnd, blockId, mode } = drag;
        const duration = originalEnd - originalStart;

        let newStart: number;
        let newEnd: number;

        if (mode === "move") {
          newStart = targetSlot;
          newEnd = targetSlot + duration;
        } else {
          // resize: snap end to target
          newStart = originalStart;
          newEnd = Math.max(originalStart + 1, targetSlot + 1);
        }

        if (newEnd > TOTAL_SLOTS) return;

        const newStartTime = slotToISO(date, newStart);
        const newEndTime = slotToISO(date, newEnd);

        if (newStartTime === slotToISO(date, originalStart) && newEndTime === slotToISO(date, originalEnd)) return;

        await editTimeBlock(blockId, { startTime: newStartTime, endTime: newEndTime });

        setBlocks((prev) =>
          prev.map((b) =>
            b.id === blockId ? { ...b, startTime: newStartTime, endTime: newEndTime } : b,
          ),
        );
      };

      document.addEventListener("mousemove", handleMove);
      document.addEventListener("mouseup", handleUp);
    },
    [date],
  );

  // Build grid: for each hour row, 6 slots
  const grid: { hour: number; slotInHour: number; slotIdx: number; block: TimeBlockData | null; isFirst: boolean; span: number }[][] = [];

  const blockStartSlots = new Map<string, number>();
  const blockEndSlots = new Map<string, number>();
  const blockSpans = new Map<string, number>();

  for (const b of blocks) {
    const s = parseStartSlot(b.startTime);
    const e = parseEndSlot(b.endTime);
    blockStartSlots.set(b.id, s);
    blockEndSlots.set(b.id, e);
    blockSpans.set(b.id, e - s);
  }

  for (let hour = 0; hour < 24; hour++) {
    const row: typeof grid[0] = [];
    const rendered = new Set<string>();

    for (let s = 0; s < SLOTS_PER_HOUR; s++) {
      const slotIdx = hour * 6 + s;
      const block = blocks.find(
        (b) => blockStartSlots.get(b.id)! <= slotIdx && blockEndSlots.get(b.id)! > slotIdx,
      ) ?? null;

      const isFirst = block ? blockStartSlots.get(block.id)! === slotIdx : false;
      const span = isFirst ? blockSpans.get(block!.id)! : 0;

      if (block && !isFirst && rendered.has(block.id)) {
        row.push({ hour, slotInHour: s, slotIdx, block, isFirst: false, span: 0 });
      } else {
        row.push({ hour, slotInHour: s, slotIdx, block, isFirst, span });
        if (block) rendered.add(block.id);
      }
    }
    grid.push(row);
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-shrink-0 border-b border-gray-200 bg-white px-5 py-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Do</h2>
        <p className="mt-0.5 text-[11px] text-gray-300">클릭: 생성 · 드래그: 이동 · 오른쪽 가장자리 드래그: 크기 조절</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <table className="w-full border-collapse select-none" data-timetable>
          <thead>
            <tr>
              <th className="sticky top-0 z-10 w-[44px] border-b border-r border-gray-100 bg-white px-1 py-1 text-[10px] text-gray-300"></th>
              {Array.from({ length: SLOTS_PER_HOUR }, (_, i) => (
                <th
                  key={i}
                  className="sticky top-0 z-10 border-b border-gray-100 bg-white py-1 text-[10px] text-gray-300"
                >
                  {`${i}0`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.map((row) => {
              const hour = row[0].hour;
              return (
                <tr key={hour}>
                  <td className="border-b border-r border-gray-100 px-1 text-right text-[11px] text-gray-300">
                    {String(hour).padStart(2, "0")}
                  </td>
                  {row.map(({ slotInHour, slotIdx, block, isFirst, span }) => {
                    if (block && !isFirst) return null;

                    return (
                      <td
                        key={slotInHour}
                        colSpan={block && isFirst ? span : 1}
                        className={`border-b border-r border-gray-100 ${!block ? "cursor-pointer transition-colors hover:bg-gray-50" : ""}`}
                        style={{ height: 40, minWidth: block ? undefined : 40 }}
                        onClick={() => !block && handleSlotClick(slotIdx)}
                      >
                        {block && isFirst ? (
                          <div
                            className="group relative flex h-full cursor-grab items-center rounded-md px-2 text-xs font-medium text-white active:cursor-grabbing"
                            style={{ backgroundColor: block.color }}
                            onMouseDown={(e) => handleDragStart(block, "move", e)}
                          >
                            <span className="pointer-events-none truncate">{block.title}</span>
                            {/* Resize handle */}
                            <div
                              className="absolute right-0 top-0 h-full w-2 cursor-ew-resize rounded-r-md opacity-0 transition-opacity group-hover:opacity-100"
                              style={{ backgroundColor: "rgba(255,255,255,0.3)" }}
                              onMouseDown={(e) => handleDragStart(block, "resize", e)}
                            />
                          </div>
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
