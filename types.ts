
export interface Lesson {
  id: string;
  date: string;
  grade: string;
  subject: string;
  classGroup: string;
  content: string;
  nextLessonSuggestions?: string;
  createdAt: number;
}

export type ViewState = 'menu' | 'form' | 'list' | 'schedule';

export interface AiSuggestion {
  content: string;
}

export interface ScheduleSlot {
  start: string;
  end: string;
  grade: string;
  classGroup: string;
  subject: string;
  content: string;
}

export interface WeeklySchedule {
  matutino: Record<string, ScheduleSlot[]>;
  vespertino: Record<string, ScheduleSlot[]>;
  noturno: Record<string, ScheduleSlot[]>;
}
