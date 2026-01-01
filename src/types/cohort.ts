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
  | 'Review Acceptance Rate'
  | 'QC Pass Rate';

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
  operator: OperatorType; // Same operators for both absolute and percentile
  value: string; // Number for absolute, percentile notation (P5, P25, P95, etc.) for percentile
  usePercentile: boolean;
}

export interface ConditionGroup {
  id: string;
  operator: LogicalOperator; // AND or OR (within group)
  conditions: CohortCondition[];
}

export interface CohortFormData {
  name: string;
  description: string;
  dateRange: string;
  workflowStep: string;
  conditionGroups: ConditionGroup[]; // Replace conditions + logicalOperators
  groupConnector: LogicalOperator; // Operator between groups
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
