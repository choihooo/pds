export interface DailyEntry {
  date: string;
  mood: number | null;
  energy: number | null;
  focus: number | null;
  goodText: string;
  improveText: string;
  thanksText: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlanItem {
  id: string;
  date: string;
  text: string;
  done: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface TimeBlock {
  id: string;
  date: string;
  title: string;
  startTime: string;
  endTime: string;
  color: string;
  createdAt: string;
}
