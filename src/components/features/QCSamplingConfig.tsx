import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { QCSamplingCohortCard } from './QCSamplingCohortCard';
import { QCSamplingCohortSelector } from './QCSamplingCohortSelector';
import { Cohort, LinkedQCCohort } from '@/types/cohort';
import { Plus, Info, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface QCSamplingConfigProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cohorts: Cohort[];
  linkedCohorts: LinkedQCCohort[];
  defaultSamplingPercentage: number;
  onSave: (defaultPercentage: number, linkedCohorts: LinkedQCCohort[]) => void;
}

export function QCSamplingConfig({
  open,
  onOpenChange,
  cohorts,
  linkedCohorts: initialLinkedCohorts,
  defaultSamplingPercentage: initialDefaultPercentage,
  onSave,
}: QCSamplingConfigProps) {
  const [linkedCohorts, setLinkedCohorts] = useState<LinkedQCCohort[]>(initialLinkedCohorts);
  const [defaultSamplingPercentage, setDefaultSamplingPercentage] = useState(initialDefaultPercentage);
  const [showSelector, setShowSelector] = useState(false);

  // Reset state when modal opens or initial values change
  useEffect(() => {
    if (open) {
      setLinkedCohorts(initialLinkedCohorts);
      setDefaultSamplingPercentage(initialDefaultPercentage);
      setShowSelector(false);
    }
  }, [open, initialLinkedCohorts, initialDefaultPercentage]);

  const hasArchivedCohorts = linkedCohorts.some((lc) => {
    const cohort = cohorts.find((c) => c.id === lc.cohortId);
    return cohort?.status === 'archived';
  });

  const handleAddCohort = (cohortId: string, samplingPercentage: number) => {
    setLinkedCohorts((prev) => [
      ...prev,
      { cohortId, samplingPercentage },
    ]);
    setShowSelector(false);
    toast({
      title: 'Cohort linked',
      description: `The cohort has been added with a sampling percentage of ${samplingPercentage}%.`,
    });
  };

  const handleRemoveCohort = (cohortId: string) => {
    setLinkedCohorts((prev) => prev.filter((lc) => lc.cohortId !== cohortId));
    toast({
      title: 'Cohort removed',
      description: 'The cohort has been removed from QC Sampling configuration.',
    });
  };

  const handlePercentageChange = (cohortId: string, percentage: number) => {
    setLinkedCohorts((prev) =>
      prev.map((lc) =>
        lc.cohortId === cohortId ? { ...lc, samplingPercentage: percentage } : lc
      )
    );
  };

  const handleSave = () => {
    // Validate default percentage
    if (defaultSamplingPercentage < 0 || defaultSamplingPercentage > 100) {
      toast({
        title: 'Invalid default percentage',
        description: 'Default sampling percentage must be between 0 and 100.',
        variant: 'destructive',
      });
      return;
    }

    // Validate cohort percentages
    const invalidPercentages = linkedCohorts.filter(
      (lc) => lc.samplingPercentage < 0 || lc.samplingPercentage > 100
    );
    if (invalidPercentages.length > 0) {
      toast({
        title: 'Invalid percentages',
        description: 'All sampling percentages must be between 0 and 100.',
        variant: 'destructive',
      });
      return;
    }

    onSave(defaultSamplingPercentage, linkedCohorts);
    onOpenChange(false);
    toast({
      title: 'Configuration saved',
      description: 'QC Sampling settings have been updated.',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Configure QC Sampling
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
                  <strong>highest sampling percentage</strong> will be applied to ensure quality.
                </p>
                <p className="text-xs text-muted-foreground border-t pt-2 mt-2">
                  Example: If a contributor belongs to cohorts with sampling percentages of 20%, 40%, 
                  and 60%, their sampling percentage will be set to 60% (the highest).
                </p>
              </TooltipContent>
            </Tooltip>
          </DialogTitle>
          <DialogDescription>
            Set default sampling percentage and link cohorts with specific sampling percentages. 
            When a linked cohort recalculates and its contributor list updates, the sampling 
            configurations will automatically re-apply to the newly updated set of contributors.
          </DialogDescription>
        </DialogHeader>

        {hasArchivedCohorts && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/30 text-warning animate-fade-in">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Archived cohort detected</p>
              <p className="text-sm opacity-90 mt-0.5">
                One or more linked cohorts have been archived. You can remove them or
                keep them (sampling will continue to apply to cached members).
              </p>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto py-2 scrollbar-thin space-y-4">
          {/* Default Sampling Percentage */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Default Sampling Percentage (%)
            </label>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={defaultSamplingPercentage || ''}
                onChange={(e) => setDefaultSamplingPercentage(parseFloat(e.target.value) || 0)}
                className="w-32"
                placeholder="0"
              />
              <p className="text-sm text-muted-foreground">
                Applied to contributors not in any linked cohort
              </p>
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Linked Cohorts */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">Linked Cohorts</h3>
              {!showSelector && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSelector(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Link Cohort
                </Button>
              )}
            </div>

            {showSelector ? (
              <QCSamplingCohortSelector
                cohorts={cohorts}
                selectedIds={linkedCohorts.map((lc) => lc.cohortId)}
                onSelect={handleAddCohort}
                onClose={() => setShowSelector(false)}
              />
            ) : (
              <div className="space-y-3">
                {linkedCohorts.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-border rounded-lg">
                    <p className="text-muted-foreground">No cohorts linked yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Add cohorts to set custom sampling percentages
                    </p>
                  </div>
                ) : (
                  <>
                    {linkedCohorts.map((lc) => {
                      const cohort = cohorts.find((c) => c.id === lc.cohortId);
                      if (!cohort) return null;
                      return (
                        <QCSamplingCohortCard
                          key={lc.cohortId}
                          cohort={cohort}
                          samplingPercentage={lc.samplingPercentage}
                          onPercentageChange={(percentage) =>
                            handlePercentageChange(lc.cohortId, percentage)
                          }
                          onRemove={() => handleRemoveCohort(lc.cohortId)}
                          isArchived={cohort.status === 'archived'}
                        />
                      );
                    })}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {!showSelector && (
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

