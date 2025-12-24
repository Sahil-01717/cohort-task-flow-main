import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FeatureToggle } from './features/FeatureToggle';
import { DailyTaskLimitModal } from './features/DailyTaskLimitModal';
import { mockCohorts } from '@/data/mockCohorts';
import { LinkedCohort } from '@/types/cohort';
import { Check, AlertTriangle, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

type TabType = 'user-assignment' | 'contributor-experience';

export function StepSettings() {
  const [activeTab, setActiveTab] = useState<TabType>('user-assignment');
  const [autoUnassign, setAutoUnassign] = useState(true);
  const [autoUnassignThreshold, setAutoUnassignThreshold] = useState('48');
  const [maxAttempts, setMaxAttempts] = useState(false);
  const [maxAttemptsValue, setMaxAttemptsValue] = useState('1');
  const [dailyTaskLimit, setDailyTaskLimit] = useState(false);
  const [showDailyLimitModal, setShowDailyLimitModal] = useState(false);
  const [linkedCohorts, setLinkedCohorts] = useState<LinkedCohort[]>([]);

  // Filter cohorts for current step (Maker)
  const stepCohorts = mockCohorts.filter((c) => c.stepId === 'step-maker');

  const hasArchivedLinkedCohorts = linkedCohorts.some((lc) => {
    const cohort = stepCohorts.find((c) => c.id === lc.cohortId);
    return cohort?.status === 'archived';
  });

  const handleSave = () => {
    toast({
      title: 'Settings saved',
      description: 'Step settings have been updated successfully.',
    });
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-foreground">Step Settings</h1>
          <Button onClick={handleSave}>Save</Button>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-8">
          <span className="flex items-center gap-1.5 text-success">
            <Check className="w-4 h-4" />
            1. Instructions
          </span>
          <span className="text-muted-foreground">{'>'}</span>
          <span className="text-muted-foreground">2. Plugins configuration</span>
          <span className="text-muted-foreground">{'>'}</span>
          <span className="font-medium text-foreground">3. More settings</span>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <Button
            variant={activeTab === 'user-assignment' ? 'default' : 'outline'}
            onClick={() => setActiveTab('user-assignment')}
          >
            User assignment
          </Button>
          <Button
            variant={activeTab === 'contributor-experience' ? 'default' : 'outline'}
            onClick={() => setActiveTab('contributor-experience')}
          >
            Contributor experience
          </Button>
        </div>

        {activeTab === 'user-assignment' && (
          <div className="space-y-8">
            {/* User assignment condition */}
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-foreground">
                  Select the user assignment condition for the rejected jobs going through this step:
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Below selected condition will get applied while launching jobs
                </p>
              </div>
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="assignment"
                    defaultChecked
                    className="mt-1 w-4 h-4 text-primary"
                  />
                  <span className="text-sm text-foreground">
                    Send to the same contributor; if that contributor is inactive, it will be
                    assigned to the next available contributor.
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="assignment"
                    className="mt-1 w-4 h-4 text-primary"
                  />
                  <span className="text-sm text-foreground">Anyone at the step can answer</span>
                </label>
              </div>
            </div>

            <div className="h-px bg-border" />

            {/* Auto un-assignment */}
            <FeatureToggle
              title="Allow auto un-assignment of in-progress tasks:"
              description="Enabling this will automatically un-assign tasks which are in-progress after a certain time period"
              enabled={autoUnassign}
              onToggle={setAutoUnassign}
            >
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Auto un-Assignment threshold
                </label>
                <Input
                  type="number"
                  value={autoUnassignThreshold}
                  onChange={(e) => setAutoUnassignThreshold(e.target.value)}
                  className="w-32"
                />
              </div>
            </FeatureToggle>

            <div className="h-px bg-border" />

            {/* Max attempts */}
            <FeatureToggle
              title="Set maximum number of attempts per task"
              description="Enabling this will automatically STOP an in-progress Job after the configured number of attempts are crossed for it at this step. Warning: This setting will stop production jobs automatically."
              enabled={maxAttempts}
              onToggle={setMaxAttempts}
            >
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Maximum number of attempts
                </label>
                <Input
                  type="number"
                  value={maxAttemptsValue}
                  onChange={(e) => setMaxAttemptsValue(e.target.value)}
                  className="w-32"
                  disabled={!maxAttempts}
                />
              </div>
            </FeatureToggle>

            <div className="h-px bg-border" />

            {/* Daily Task Limit */}
            <FeatureToggle
              title="Daily task limit"
              description="Enabling this will let you set daily task limits for contributors based on their performance cohorts."
              enabled={dailyTaskLimit}
              onToggle={(enabled) => {
                setDailyTaskLimit(enabled);
                if (enabled && linkedCohorts.length === 0) {
                  setShowDailyLimitModal(true);
                }
              }}
              onConfigure={() => setShowDailyLimitModal(true)}
              showSettings={true}
              warning={
                hasArchivedLinkedCohorts && dailyTaskLimit ? (
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
                ) : null
              }
            >
              {linkedCohorts.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-md">
                  <Users className="w-4 h-4" />
                  <span>
                    {linkedCohorts.length} cohort{linkedCohorts.length !== 1 ? 's' : ''} linked with
                    daily limits configured
                  </span>
                </div>
              )}
            </FeatureToggle>
          </div>
        )}

        {activeTab === 'contributor-experience' && (
          <div className="text-center py-16 text-muted-foreground">
            <p>Contributor experience settings will appear here</p>
          </div>
        )}
      </div>

      {/* Daily Task Limit Modal */}
      <DailyTaskLimitModal
        open={showDailyLimitModal}
        onOpenChange={setShowDailyLimitModal}
        cohorts={stepCohorts}
        linkedCohorts={linkedCohorts}
        onSave={setLinkedCohorts}
      />
    </div>
  );
}
