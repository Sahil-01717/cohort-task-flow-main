import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CohortCard } from './CohortCard';
import { CohortSelector } from './CohortSelector';
import { Cohort, LinkedCohort } from '@/types/cohort';
import { Plus, Info, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface DailyTaskLimitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cohorts: Cohort[];
  linkedCohorts: LinkedCohort[];
  onSave: (linkedCohorts: LinkedCohort[]) => void;
}

export function DailyTaskLimitModal({
  open,
  onOpenChange,
  cohorts,
  linkedCohorts: initialLinkedCohorts,
  onSave,
}: DailyTaskLimitModalProps) {
  const [linkedCohorts, setLinkedCohorts] = useState<LinkedCohort[]>(initialLinkedCohorts);
  const [showSelector, setShowSelector] = useState(false);

  // Reset state when modal opens or initialLinkedCohorts changes
  useEffect(() => {
    if (open) {
      setLinkedCohorts(initialLinkedCohorts);
      setShowSelector(false);
    }
  }, [open, initialLinkedCohorts]);

  const hasArchivedCohorts = linkedCohorts.some((lc) => {
    const cohort = cohorts.find((c) => c.id === lc.cohortId);
    return cohort?.status === 'archived';
  });

  const handleAddCohort = (cohortId: string, dailyLimit: number) => {
    setLinkedCohorts((prev) => [
      ...prev,
      { cohortId, dailyLimit },
    ]);
    setShowSelector(false);
    toast({
      title: 'Cohort linked',
      description: `The cohort has been added with a daily limit of ${dailyLimit} tasks.`,
    });
  };

  const handleRemoveCohort = (cohortId: string) => {
    setLinkedCohorts((prev) => prev.filter((lc) => lc.cohortId !== cohortId));
    toast({
      title: 'Cohort removed',
      description: 'The cohort has been removed from Daily Task Limits.',
    });
  };

  const handleLimitChange = (cohortId: string, limit: number) => {
    setLinkedCohorts((prev) =>
      prev.map((lc) =>
        lc.cohortId === cohortId ? { ...lc, dailyLimit: limit } : lc
      )
    );
  };

  const handleSave = () => {
    // Validate limits
    const invalidLimits = linkedCohorts.filter((lc) => lc.dailyLimit < 1);
    if (invalidLimits.length > 0) {
      toast({
        title: 'Invalid limits',
        description: 'All daily limits must be at least 1.',
        variant: 'destructive',
      });
      return;
    }

    onSave(linkedCohorts);
    onOpenChange(false);
    toast({
      title: 'Configuration saved',
      description: 'Daily Task Limit settings have been updated.',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Configure Daily Task Limits
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <Info className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="start" className="max-w-sm z-[100]">
                <p className="font-medium mb-2">Multi-Cohort Conflict Resolution</p>
                <p className="text-sm mb-2">
                  If a contributor belongs to multiple linked cohorts, the{' '}
                  <strong>lowest limit</strong> will be applied to protect quality.
                </p>
                <p className="text-xs text-muted-foreground border-t pt-2 mt-2">
                  Example: If a contributor belongs to cohorts with limits of 5, 10, and 15, 
                  their daily limit will be set to 5 (the lowest).
                </p>
              </TooltipContent>
            </Tooltip>
          </DialogTitle>
          <DialogDescription>
            Link cohorts and set daily task limits for contributors. Limits are enforced
            automatically based on cohort membership. When a linked cohort recalculates and 
            its contributor list updates, the task limit configurations will automatically 
            re-apply to the newly updated set of contributors.
          </DialogDescription>
        </DialogHeader>

        {hasArchivedCohorts && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/30 text-warning animate-fade-in">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Archived cohort detected</p>
              <p className="text-sm opacity-90 mt-0.5">
                One or more linked cohorts have been archived. You can remove them or
                keep them (limits will continue to apply to cached members).
              </p>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto py-2 scrollbar-thin">
          {showSelector ? (
            <CohortSelector
              cohorts={cohorts}
              selectedIds={linkedCohorts.map((lc) => lc.cohortId)}
              onSelect={handleAddCohort}
              onClose={() => setShowSelector(false)}
            />
          ) : (
            <div className="space-y-3">
              {linkedCohorts.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-border rounded-lg">
                  <p className="text-muted-foreground">No cohorts linked yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add cohorts to start limiting daily tasks
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setShowSelector(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Link Cohort
                  </Button>
                </div>
              ) : (
                <>
                  {linkedCohorts.map((lc) => {
                    const cohort = cohorts.find((c) => c.id === lc.cohortId);
                    if (!cohort) return null;
                    return (
                      <CohortCard
                        key={lc.cohortId}
                        cohort={cohort}
                        dailyLimit={lc.dailyLimit}
                        onLimitChange={(limit) => handleLimitChange(lc.cohortId, limit)}
                        onRemove={() => handleRemoveCohort(lc.cohortId)}
                        isArchived={cohort.status === 'archived'}
                      />
                    );
                  })}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowSelector(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Link Another Cohort
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        {!showSelector && linkedCohorts.length > 0 && (
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              {linkedCohorts.length} cohort{linkedCohorts.length !== 1 ? 's' : ''} linked
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save Configuration</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
