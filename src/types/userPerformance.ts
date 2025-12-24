export interface UserPerformance {
  email: string;
  tasksSubmitted: number;
  tasksSkipped: number;
  totalTimeTaken: number; // in minutes
  avgHandlingTime: number; // in minutes
  tasksRejected: number;
  tasksAccepted: number;
}

export interface UserPerformanceFilters {
  role: string;
  dateRange: string;
  batch: string;
  searchEmail: string;
}

