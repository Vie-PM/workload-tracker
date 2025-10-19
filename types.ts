
export interface Session {
  id: string;
  startTime: number;
  endTime: number;
  duration: number; // in seconds
  note: string;
  date: string; // YYYY-MM-DD
}

export interface Project {
  id: string;
  name: string;
  isHidden: boolean;
  sessions: Session[];
}

export interface TimerState {
    isRunning: boolean;
    currentProjectId: string | null;
    currentSessionStart: number | null;
    currentNote: string;
}

export interface ProjectStat {
    projectId: string;
    projectName: string;
    hours: number;
}

export type ReportType = 'day' | 'week' | 'month';

export interface Alert {
  message: string;
  type: 'success' | 'warning' | 'error';
}
