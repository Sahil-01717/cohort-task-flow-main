import { Contributor } from '@/types/cohort';

export const mockContributors: Contributor[] = [
  {
    email: 'sahil.choudhary@telusinternational.com',
    completedJobs: 2,
    sampledTasks: 1,
    samplingPercentage: 12,
    cohortIds: ['cohort-7', 'cohort-8'], // Belongs to multiple cohorts
  },
  {
    email: 'mayank.kumar05@telusinternational.com',
    completedJobs: 1,
    sampledTasks: 2,
    samplingPercentage: 0,
    cohortIds: [], // No cohorts - uses default
  },
  {
    email: 'john.doe@telusinternational.com',
    completedJobs: 5,
    sampledTasks: 3,
    samplingPercentage: 40,
    cohortIds: ['cohort-8'],
  },
  {
    email: 'jane.smith@telusinternational.com',
    completedJobs: 10,
    sampledTasks: 2,
    samplingPercentage: 20,
    cohortIds: ['cohort-7'],
  },
  {
    email: 'alex.johnson@telusinternational.com',
    completedJobs: 3,
    sampledTasks: 1,
    samplingPercentage: 60,
    cohortIds: ['cohort-8', 'cohort-9', 'cohort-10'], // Multiple cohorts - highest applies
  },
];

