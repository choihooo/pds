"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";

const DAYS_KO = ["일", "월", "화", "수", "목", "금", "토"] as const;

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const day = DAYS_KO[d.getDay()];
  return `${dateStr} (${day})`;
}

function shiftDate(dateStr: string, days: number) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

interface DateNavProps {
  date: string;
}

export default function DateNav({ date }: DateNavProps) {
  const router = useRouter();

  const go = useCallback(
    (direction: -1 | 1) => {
      router.push(`/${shiftDate(date, direction)}`);
    },
    [router, date],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.altKey && e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      }
      if (e.altKey && e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [go]);

  const handleDatePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      router.push(`/${e.target.value}`);
    }
  };

  return (
    <nav className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => go(-1)}
        className="rounded-md px-2 py-1 text-lg text-gray-600 hover:bg-gray-100"
        aria-label="이전 날짜"
      >
        ←
      </button>
      <label className="relative cursor-pointer">
        <span className="text-lg font-medium text-gray-800">
          {formatDate(date)}
        </span>
        <input
          type="date"
          value={date}
          onChange={handleDatePick}
          className="absolute inset-0 cursor-pointer opacity-0"
          aria-label="날짜 선택"
        />
      </label>
      <button
        type="button"
        onClick={() => go(1)}
        className="rounded-md px-2 py-1 text-lg text-gray-600 hover:bg-gray-100"
        aria-label="다음 날짜"
      >
        →
      </button>
    </nav>
  );
}
