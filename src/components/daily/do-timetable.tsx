"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { ThirdPartyDraggable } from "@fullcalendar/interaction";
import { createTimeBlock, removeTimeBlock, editTimeBlock } from "@/lib/actions";

const COLORS = ["#4a5568", "#5a7a6b", "#7a6b5a", "#5a6b7a", "#6b5a7a", "#7a5a6b"];

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

export default function DoTimetable({ date, initialBlocks, refreshKey }: DoTimetableProps) {
  const [blocks, setBlocks] = useState<TimeBlockData[]>(initialBlocks);
  const calendarRef = useRef<FullCalendar>(null);

  // Enable FullCalendar to receive native HTML5 drag from [data-event] elements
  useEffect(() => {
    const thirdParty = new ThirdPartyDraggable(document, {
      itemSelector: "[data-event]",
    });
    return () => thirdParty.destroy();
  }, []);

  const toEvents = (bs: TimeBlockData[]) =>
    bs.map((b) => ({
      id: b.id,
      title: b.title,
      start: b.startTime,
      end: b.endTime,
      backgroundColor: b.color,
      borderColor: b.color,
    }));

  // Select empty area → create block
  const handleSelect = useCallback(
    async (info: { startStr: string; endStr: string }) => {
      const title = prompt("할 일을 입력하세요");
      if (!title) return;
      const color = COLORS[blocks.length % COLORS.length];
      const id = crypto.randomUUID();

      await createTimeBlock({
        id,
        date,
        title,
        startTime: info.startStr,
        endTime: info.endStr,
        color,
      });
      setBlocks((prev) => [
        ...prev,
        { id, title, startTime: info.startStr, endTime: info.endStr, color },
      ]);
    },
    [date, blocks],
  );

  // Click event → delete
  const handleEventClick = useCallback(
    async (info: { event: { id: string; title: string } }) => {
      if (confirm(`"${info.event.title}" 삭제?`)) {
        await removeTimeBlock(info.event.id);
        setBlocks((prev) => prev.filter((b) => b.id !== info.event.id));
      }
    },
    [],
  );

  // Drag event → move
  const handleEventDrop = useCallback(
    async (info: { event: { id: string; startStr: string; endStr: string }; revert: () => void }) => {
      try {
        await editTimeBlock(info.event.id, {
          startTime: info.event.startStr,
          endTime: info.event.endStr,
        });
        setBlocks((prev) =>
          prev.map((b) =>
            b.id === info.event.id
              ? { ...b, startTime: info.event.startStr, endTime: info.event.endStr }
              : b,
          ),
        );
      } catch {
        info.revert();
      }
    },
    [],
  );

  // Resize event
  const handleEventResize = useCallback(
    async (info: { event: { id: string; startStr: string; endStr: string }; revert: () => void }) => {
      try {
        await editTimeBlock(info.event.id, {
          startTime: info.event.startStr,
          endTime: info.event.endStr,
        });
        setBlocks((prev) =>
          prev.map((b) =>
            b.id === info.event.id
              ? { ...b, startTime: info.event.startStr, endTime: info.event.endStr }
              : b,
          ),
        );
      } catch {
        info.revert();
      }
    },
    [],
  );

  // Drop from Plan → 1-hour block
  const handleDrop = useCallback(
    (info: { date: Date; draggedEl: HTMLElement }) => {
      const raw = info.draggedEl.getAttribute("data-event");
      if (!raw) return;

      let data: { title: string; duration: string; color: string };
      try {
        data = JSON.parse(raw);
      } catch {
        return;
      }

      const pad = (n: number) => String(n).padStart(2, "0");
      const startDate = info.date;
      const startTime = `${startDate.getFullYear()}-${pad(startDate.getMonth() + 1)}-${pad(startDate.getDate())}T${pad(startDate.getHours())}:${pad(startDate.getMinutes())}:00`;

      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
      const endTime = `${endDate.getFullYear()}-${pad(endDate.getMonth() + 1)}-${pad(endDate.getDate())}T${pad(endDate.getHours())}:${pad(endDate.getMinutes())}:00`;

      const id = crypto.randomUUID();

      createTimeBlock({ id, date, title: data.title, startTime, endTime, color: data.color }).then(() => {
        setBlocks((prev) => [...prev, { id, title: data.title, startTime, endTime, color: data.color }]);
      });
    },
    [date],
  );

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-shrink-0 border-b border-gray-200 bg-white px-5 py-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Do</h2>
        <p className="mt-0.5 text-[11px] text-gray-300">Plan에서 드래그 · 빈 영역 드래그: 생성 · 블록 이동/리사이즈</p>
      </div>

      <div className="flex-1 overflow-hidden">
        <FullCalendar
          ref={calendarRef}
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView="timeGridDay"
          initialDate={date}
          headerToolbar={false}
          slotDuration="00:10:00"
          slotMinTime="06:00:00"
          slotMaxTime="24:00:00"
          allDaySlot={false}
          editable={true}
          selectable={true}
          selectMirror={true}
          droppable={true}
          defaultTimedEventDuration="01:00:00"
          events={toEvents(blocks)}
          height="100%"
          expandRows={true}
          nowIndicator={true}
          select={handleSelect}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          drop={(info) => {
            console.log("[FC drop]", info);
            handleDrop(info);
          }}
          eventReceive={(info) => {
            console.log("[FC eventReceive]", info.event.title, info.event.start, info.event.end);
            info.event.remove();
          }}
        />
      </div>
    </div>
  );
}
