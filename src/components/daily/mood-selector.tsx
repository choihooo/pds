"use client";

import { useState } from "react";
import { saveMood } from "@/lib/actions";

interface MoodSelectorProps {
  date: string;
  initialMood: number | null;
  initialEnergy: number | null;
  initialFocus: number | null;
}

function DotRow({
  label,
  emoji,
  value,
  onChange,
}: {
  label: string;
  emoji: string;
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="mr-1 text-sm" title={label}>
        {emoji}
      </span>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(value === n ? null : n)}
          className={`h-5 w-5 rounded-full border-2 transition-colors ${
            value !== null && n <= value
              ? "border-gray-700 bg-gray-700"
              : "border-gray-300 bg-white"
          }`}
          aria-label={`${label} ${n}`}
        />
      ))}
    </div>
  );
}

export default function MoodSelector({
  date,
  initialMood,
  initialEnergy,
  initialFocus,
}: MoodSelectorProps) {
  const [mood, setMood] = useState(initialMood);
  const [energy, setEnergy] = useState(initialEnergy);
  const [focus, setFocus] = useState(initialFocus);

  const handleChange = async (
    type: "mood" | "energy" | "focus",
    setter: (v: number | null) => void,
    value: number | null,
  ) => {
    setter(value);
    try {
      await saveMood(date, type, value);
    } catch {
      // silent fail — auto-retry not critical for mood
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <DotRow
        label="기분"
        emoji="😊"
        value={mood}
        onChange={(v) => handleChange("mood", setMood, v)}
      />
      <DotRow
        label="에너지"
        emoji="⚡"
        value={energy}
        onChange={(v) => handleChange("energy", setEnergy, v)}
      />
      <DotRow
        label="집중"
        emoji="🎯"
        value={focus}
        onChange={(v) => handleChange("focus", setFocus, v)}
      />
    </div>
  );
}
