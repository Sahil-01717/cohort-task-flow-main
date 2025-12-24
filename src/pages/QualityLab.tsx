import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Settings2, AlertTriangle, Users, Info } from 'lucide-react';
import { QCSamplingConfig } from '@/components/features/QCSamplingConfig';
import { ContributorTable } from '@/components/features/ContributorTable';
import { mockCohorts } from '@/data/mockCohorts';
import { mockContributors } from '@/data/mockContributors';
import { LinkedQCCohort, QCSamplingConfig as QCSamplingConfigType } from '@/types/cohort';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type QCTabType = 'config' | 'awaiting' | 'in-progress' | 'completed' | 'cancelled';

export function QualityLab() {
  const [activeTab, setActiveTab] = useState<QCTabType>('config');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [defaultSamplingPercentage, setDefaultSamplingPercentage] = useState(100);
  const [linkedCohorts, setLinkedCohorts] = useState<LinkedQCCohort[]>([]);
  const [searchEmail, setSearchEmail] = useState('');

  // Filter cohorts for Reviewer and Rework steps only (as per requirements)
  const qcEligibleCohorts = mockCohorts.filter(
    (c) => c.stepId === 'step-reviewer' || c.stepId === 'step-rework'
  );

  const hasArchivedLinkedCohorts = linkedCohorts.some((lc) => {
    const cohort = qcEligibleCohorts.find((c) => c.id === lc.cohortId);
    return cohort?.status === 'archived';
  });

  // Filter contributors based on search
  const filteredContributors = mockContributors.filter((contributor) =>
    contributor.email.toLowerCase().includes(searchEmail.toLowerCase())
  );

  // Calculate sampling percentages for contributors based on cohorts
  // This would normally be done on the backend, but for the prototype we'll simulate it
  const contributorsWithSampling = filteredContributors.map((contributor) => {
    if (contributor.cohortIds.length === 0) {
      return {
        ...contributor,
        samplingPercentage: defaultSamplingPercentage,
      };
    }

    // Find the highest sampling percentage from linked cohorts (multi-cohort conflict resolution)
    const cohortPercentages = contributor.cohortIds
      .map((cohortId) => {
        const linkedCohort = linkedCohorts.find((lc) => lc.cohortId === cohortId);
        return linkedCohort?.samplingPercentage;
      })
      .filter((p): p is number => p !== undefined);

    const highestPercentage =
      cohortPercentages.length > 0
        ? Math.max(...cohortPercentages)
        : defaultSamplingPercentage;

    return {
      ...contributor,
      samplingPercentage: highestPercentage,
    };
  });

  const handleSaveConfig = (defaultPercentage: number, cohorts: LinkedQCCohort[]) => {
    setDefaultSamplingPercentage(defaultPercentage);
    setLinkedCohorts(cohorts);
  };

  const tabs = [
    { id: 'config' as QCTabType, label: 'QC Sampling config', count: null },
    { id: 'awaiting' as QCTabType, label: 'Awaiting QC', count: 2 },
    { id: 'in-progress' as QCTabType, label: 'QC In Progress', count: 1 },
    { id: 'completed' as QCTabType, label: 'QC Completed', count: 2 },
    { id: 'cancelled' as QCTabType, label: 'QC Cancelled', count: 0 },
  ];

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground mb-2">Quality Lab</h1>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">1. Quality Rubric</span>
            <span className="text-muted-foreground">{'>'}</span>
            <span className="font-medium text-foreground underline">2. Quality Check</span>
            <span className="text-muted-foreground">{'>'}</span>
            <span className="text-muted-foreground">3. Live Feedback Agent</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
              {tab.count !== null && (
                <span className="ml-2 text-muted-foreground">({tab.count})</span>
              )}
            </button>
          ))}
        </div>

        {/* QC Sampling Config Tab */}
        {activeTab === 'config' && (
          <div className="space-y-6">
            {/* Default Sampling Section */}
            <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-foreground">
                  Default Sampling {defaultSamplingPercentage}%
                </span>
                <button
                  onClick={() => setShowConfigModal(true)}
                  className="p-1 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Edit sampling configuration"
                >
                  <Settings2 className="w-4 h-4" />
                </button>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-muted-foreground hover:text-foreground">
                      <Info className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Default sampling percentage applied to contributors not in any linked cohort</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Warning for archived cohorts */}
            {hasArchivedLinkedCohorts && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/30 text-warning">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Archived cohort linked</p>
                  <p className="text-xs opacity-90 mt-0.5">
                    One or more linked cohorts have been archived. Click the settings icon to
                    review and update your configuration.
                  </p>
                </div>
              </div>
            )}

            {/* Linked Cohorts Summary */}
            {linkedCohorts.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-md">
                <Users className="w-4 h-4" />
                <span>
                  {linkedCohorts.length} cohort{linkedCohorts.length !== 1 ? 's' : ''} linked with
                  custom sampling percentages
                </span>
              </div>
            )}

            {/* Search and Actions */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by Email"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Contributors Table */}
            <ContributorTable contributors={contributorsWithSampling} />
          </div>
        )}

        {/* Other Tabs - Placeholder */}
        {activeTab !== 'config' && (
          <div className="text-center py-16 text-muted-foreground">
            <p>{tabs.find((t) => t.id === activeTab)?.label} content will appear here</p>
          </div>
        )}
      </div>

      {/* QC Sampling Config Modal */}
      <QCSamplingConfig
        open={showConfigModal}
        onOpenChange={setShowConfigModal}
        cohorts={qcEligibleCohorts}
        linkedCohorts={linkedCohorts}
        defaultSamplingPercentage={defaultSamplingPercentage}
        onSave={handleSaveConfig}
      />
    </div>
  );
}

