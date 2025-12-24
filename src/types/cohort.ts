export interface Cohort {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  memberType: 'Makers' | 'Reviewer';
  dateRange: string;
  updatedAt: string;
  status: 'live' | 'archived';
  stepId: string;
  conditions?: CohortCondition[];
}

export type MetricType = 
  | 'Tasks submitted'
  | 'Tasks skipped'
  | 'Tasks rejected'
  | 'Tasks accepted'
  | 'Total time taken'
  | 'Avg. handling time'
  | 'Accuracy rate'
  | 'Rejection rate';

export type OperatorType = 
  | 'is Greater than (>)'
  | 'is Less than (<)'
  | 'is Equal to (=)'
  | 'is Greater than or equal to (>=)'
  | 'is Less than or equal to (<=)';

export type LogicalOperator = 'AND' | 'OR';

export interface CohortCondition {
  id: string;
  metric: MetricType;
  operator: OperatorType;
  value: string; // Can be a number or percentile like "P5"
  usePercentile: boolean;
}

export interface CohortFormData {
  name: string;
  description: string;
  dateRange: string;
  workflowStep: string;
  conditions: CohortCondition[];
  logicalOperators: LogicalOperator[]; // Between conditions
}

export interface LinkedCohort {
  cohortId: string;
  dailyLimit: number;
}

export interface DailyTaskLimitConfig {
  enabled: boolean;
  linkedCohorts: LinkedCohort[];
}

export interface LinkedQCCohort {
  cohortId: string;
  samplingPercentage: number;
}

export interface QCSamplingConfig {
  defaultSamplingPercentage: number;
  linkedCohorts: LinkedQCCohort[];
}

export interface Contributor {
  email: string;
  completedJobs: number;
  sampledTasks: number;
  samplingPercentage: number;
  cohortIds: string[];
}
