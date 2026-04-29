"use client";

import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

interface PlanItem {
  id: string;
  text: string;
  done: boolean;
  scheduled?: string;
}

const COLORS = [
  "#4a5568",
  "#5a7a6b",
  "#7a6b5a",
  "#5a6b7a",
  "#6b5a7a",
  "#7a5a6b",
];

export default function MockupPage() {
  const [plans, setPlans] = useState<PlanItem[]>([
    { id: "1", text: "PDS 일기장 MVP 마무리", done: false, scheduled: "09:00" },
    { id: "2", text: "코드 리뷰 반영", done: true, scheduled: "11:00" },
    { id: "3", text: "DB 스키마 작성", done: true, scheduled: "13:00" },
    { id: "4", text: "UI 목업 피드백 반영", done: false },
    { id: "5", text: "저녁 산책 30분", done: false },
    { id: "6", text: "독서 20분", done: false },
  ]);

  const [newItem, setNewItem] = useState("");

  const [events, setEvents] = useState([
    {
      id: "e1",
      title: "기상 · 아침 루틴",
      start: "2026-04-29T06:30:00",
      end: "2026-04-29T07:00:00",
      backgroundColor: COLORS[0],
      borderColor: COLORS[0],
    },
    {
      id: "e2",
      title: "아침 식사",
      start: "2026-04-29T07:30:00",
      end: "2026-04-29T08:00:00",
      backgroundColor: COLORS[1],
      borderColor: COLORS[1],
    },
    {
      id: "e3",
      title: "PDS MVP 작업",
      start: "2026-04-29T09:00:00",
      end: "2026-04-29T10:00:00",
      backgroundColor: COLORS[2],
      borderColor: COLORS[2],
    },
  ]);

  const addPlan = () => {
    if (!newItem.trim()) return;
    setPlans([...plans, { id: Date.now().toString(), text: newItem.trim(), done: false }]);
    setNewItem("");
  };

  const toggleDone = (id: string) => {
    setPlans(plans.map((p) => (p.id === id ? { ...p, done: !p.done } : p)));
  };

  const assignTime = (plan: PlanItem) => {
    const start = prompt("시작 시간을 입력하세요 (HH:MM)", "09:00");
    if (!start) return;
    const duration = prompt("소요 시간 (분)", "30");
    if (!duration) return;

    const [h, m] = start.split(":").map(Number);
    const startStr = `2026-04-29T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
    const endMin = h * 60 + m + parseInt(duration);
    const endH = Math.floor(endMin / 60);
    const endM = endMin % 60;
    const endStr = `2026-04-29T${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}:00`;

    const colorIdx = events.length % COLORS.length;
    setEvents([
      ...events,
      {
        id: `e${Date.now()}`,
        title: plan.text,
        start: startStr,
        end: endStr,
        backgroundColor: COLORS[colorIdx],
        borderColor: COLORS[colorIdx],
      },
    ]);
    setPlans(plans.map((p) => (p.id === plan.id ? { ...p, scheduled: start } : p)));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#f8f8f6" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 24px",
          borderBottom: "1px solid #e5e5e5",
          background: "#fff",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button style={navBtnStyle}>←</button>
          <span style={{ fontWeight: 600, fontSize: 16 }}>2026.04.29 (수)</span>
          <button style={navBtnStyle}>→</button>
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          <MoodRow label="😊 기분" value={3} />
          <MoodRow label="⚡ 에너지" value={2} />
          <MoodRow label="🎯 집중" value={4} />
        </div>
      </div>

      {/* Upper: Plan | Do */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "300px 1fr",
          flex: 3,
          minHeight: 0,
          overflow: "hidden",
          borderBottom: "2px solid #e5e5e5",
        }}
      >
        {/* Plan */}
        <div
          style={{
            borderRight: "1px solid #e5e5e5",
            display: "flex",
            flexDirection: "column",
            background: "#fff",
          }}
        >
          <div style={{ padding: "14px 20px 10px", borderBottom: "1px solid #e5e5e5" }}>
            <div style={colTitleStyle}>Plan</div>
            <div style={{ fontSize: 11, color: "#bbb", marginTop: 2 }}>
              할 일을 추가하고 시간을 지정하세요
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: 10 }}>
            {plans.map((plan) => (
              <div
                key={plan.id}
                style={{
                  background: "#f7f7f5",
                  borderRadius: 8,
                  padding: "10px 14px",
                  marginBottom: 6,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  border: "1px solid transparent",
                  cursor: "pointer",
                }}
                onMouseOver={(e) => (e.currentTarget.style.borderColor = "#e0e0e0")}
                onMouseOut={(e) => (e.currentTarget.style.borderColor = "transparent")}
              >
                <div
                  onClick={() => toggleDone(plan.id)}
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 4,
                    border: `2px solid ${plan.done ? "#4a5568" : "#d0d0d0"}`,
                    background: plan.done ? "#4a5568" : "transparent",
                    flexShrink: 0,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 11,
                  }}
                >
                  {plan.done && "✓"}
                </div>
                <span
                  style={{
                    flex: 1,
                    fontSize: 14,
                    color: plan.done ? "#bbb" : "#333",
                    textDecoration: plan.done ? "line-through" : "none",
                  }}
                >
                  {plan.text}
                </span>
                {plan.scheduled ? (
                  <span
                    style={{
                      fontSize: 11,
                      color: "#999",
                      background: "#eee",
                      padding: "2px 6px",
                      borderRadius: 4,
                    }}
                  >
                    {plan.scheduled}
                  </span>
                ) : (
                  <button
                    onClick={() => assignTime(plan)}
                    style={{
                      fontSize: 11,
                      color: "#999",
                      background: "#eee",
                      border: "none",
                      padding: "2px 8px",
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                  >
                    + 시간
                  </button>
                )}
              </div>
            ))}
          </div>

          <div
            style={{
              padding: "10px 14px",
              borderTop: "1px solid #e5e5e5",
              display: "flex",
              gap: 8,
              flexShrink: 0,
            }}
          >
            <input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addPlan()}
              placeholder="+ 항목 추가"
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                fontSize: 13,
                color: "#333",
                background: "transparent",
              }}
            />
            {newItem && (
              <button
                onClick={addPlan}
                style={{
                  background: "#4a5568",
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  padding: "4px 12px",
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                추가
              </button>
            )}
          </div>
        </div>

        {/* Do: FullCalendar */}
        <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "14px 20px 10px", borderBottom: "1px solid #e5e5e5", background: "#fff" }}>
            <div style={colTitleStyle}>Do</div>
            <div style={{ fontSize: 11, color: "#bbb", marginTop: 2 }}>시간 블록을 드래그해서 만들세요</div>
          </div>
          <div style={{ flex: 1, overflow: "hidden" }}>
            <FullCalendar
              plugins={[timeGridPlugin, interactionPlugin]}
              initialView="timeGridDay"
              initialDate="2026-04-29"
              headerToolbar={false}
              slotDuration="00:10:00"
              slotMinTime="06:00:00"
              slotMaxTime="24:00:00"
              allDaySlot={false}
              editable={true}
              selectable={true}
              selectMirror={true}
              events={events}
              eventColor="#4a5568"
              height="100%"
              expandRows={true}
              nowIndicator={true}
              select={(info) => {
                const title = prompt("할 일을 입력하세요");
                if (!title) return;
                const colorIdx = events.length % COLORS.length;
                setEvents([
                  ...events,
                  {
                    id: `e${Date.now()}`,
                    title,
                    start: info.startStr,
                    end: info.endStr,
                    backgroundColor: COLORS[colorIdx],
                    borderColor: COLORS[colorIdx],
                  },
                ]);
              }}
              eventClick={(info) => {
                if (confirm(`"${info.event.title}" 삭제?`)) {
                  setEvents(events.filter((e) => e.id !== info.event.id));
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* See */}
      <div style={{ flex: 1.2, minHeight: 0, background: "#fff", padding: "16px 24px", overflowY: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, height: "100%" }}>
          <SeeBlock title="잘한 점" placeholder="오늘 잘한 일을 적어보세요..." defaultText="MVP 빌드 성공" />
          <SeeBlock title="개선할 점" placeholder="내일은 어떻게 개선할까요?" />
          <SeeBlock title="감사한 점" placeholder="오늘 감사한 일..." defaultText="맑은 날씨" />
        </div>
      </div>
    </div>
  );
}

function MoodRow({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <span style={{ fontSize: 12, color: "#999", marginRight: 4 }}>{label}</span>
      {[1, 2, 3, 4, 5].map((n) => (
        <div
          key={n}
          style={{
            width: 14,
            height: 14,
            borderRadius: "50%",
            border: `1.5px solid ${n <= value ? "#4a5568" : "#ddd"}`,
            background: n <= value ? "#4a5568" : "transparent",
          }}
        />
      ))}
    </div>
  );
}

function SeeBlock({ title, placeholder, defaultText }: { title: string; placeholder: string; defaultText?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
        {title}
      </div>
      <textarea
        defaultValue={defaultText}
        placeholder={placeholder}
        style={{
          flex: 1,
          border: "1px solid #eaeaea",
          borderRadius: 8,
          padding: 12,
          fontFamily: "Inter, sans-serif",
          fontSize: 13,
          lineHeight: 1.7,
          color: "#333",
          resize: "none",
          outline: "none",
        }}
      />
    </div>
  );
}

const navBtnStyle: React.CSSProperties = {
  background: "none",
  border: "1px solid #e0e0e0",
  borderRadius: 6,
  width: 32,
  height: 32,
  cursor: "pointer",
  fontSize: 14,
  color: "#666",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const colTitleStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: 1.5,
  color: "#888",
};
