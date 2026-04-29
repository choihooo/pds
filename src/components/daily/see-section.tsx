"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { saveSeeSection } from "@/lib/actions";

type SeeField = "goodText" | "improveText" | "thanksText";

interface SeeSectionProps {
  date: string;
  initialGood: string;
  initialImprove: string;
  initialThanks: string;
}

function SeeBlock({
  title,
  field,
  date,
  initialValue,
  placeholder,
}: {
  title: string;
  field: SeeField;
  date: string;
  initialValue: string;
  placeholder: string;
}) {
  const [value, setValue] = useState(initialValue);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback(
    async (v: string) => {
      await saveSeeSection(date, field, v);
    },
    [date, field],
  );

  const handleChange = (next: string) => {
    setValue(next);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => flush(next), 500);
  };

  const handleBlur = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    flush(value);
  };

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue, date]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
        {title}
      </h3>
      <textarea
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
        placeholder={placeholder}
        className="flex-1 rounded-lg border border-gray-200 p-3 text-sm leading-relaxed text-gray-700 outline-none transition-colors focus:border-gray-300"
      />
    </div>
  );
}

export default function SeeSection({ date, initialGood, initialImprove, initialThanks }: SeeSectionProps) {
  return (
    <div className="flex-1 overflow-y-auto bg-white px-6 py-4">
      <div className="grid h-full grid-cols-3 gap-4">
        <SeeBlock
          title="잘한 점"
          field="goodText"
          date={date}
          initialValue={initialGood}
          placeholder="오늘 잘한 일을 적어보세요..."
        />
        <SeeBlock
          title="개선할 점"
          field="improveText"
          date={date}
          initialValue={initialImprove}
          placeholder="내일은 어떻게 개선할까요?"
        />
        <SeeBlock
          title="감사한 점"
          field="thanksText"
          date={date}
          initialValue={initialThanks}
          placeholder="오늘 감사한 일..."
        />
      </div>
    </div>
  );
}
