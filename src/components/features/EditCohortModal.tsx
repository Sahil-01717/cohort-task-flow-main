import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Cohort,
  CohortCondition,
  CohortFormData,
  LogicalOperator,
  MetricType,
  OperatorType,
} from '@/types/cohort';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface EditCohortModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cohort: Cohort | null;
  onSave: (cohortId: string, data: CohortFormData) => void;
}

const metrics: MetricType[] = [
  'Tasks submitted',
  'Tasks skipped',
  'Tasks rejected',
  'Tasks accepted',
  'Total time taken',
  'Avg. handling time',
  'Accuracy rate',
  'Rejection rate',
];

const operators: OperatorType[] = [
  'is Greater than (>)',
  'is Less than (<)',
  'is Equal to (=)',
  'is Greater than or equal to (>=)',
  'is Less than or equal to (<=)',
];

const dateRanges = ['7 days', '15 days', '30 days', '60 days', 'All time'];
const workflowSteps = ['Maker', 'Reviewer', 'Quality Check', 'Rework'];

// Simple ID generator
let idCounter = 0;
const generateId = () => `condition-${Date.now()}-${++idCounter}`;

export function EditCohortModal({
  open,
  onOpenChange,
  cohort,
  onSave,
}: EditCohortModalProps) {
  const [activeTab, setActiveTab] = useState<'insights' | 'settings'>('insights');
  const [formData, setFormData] = useState<CohortFormData>({
    name: '',
    description: '',
    dateRange: '30 days',
    workflowStep: 'Maker',
    conditions: [],
    logicalOperators: [],
  });

  // Initialize form data when cohort changes
  useEffect(() => {
    if (cohort && open) {
      // Parse date range (e.g., "Last 30 days" -> "30 days", "All time" -> "All time")
      let dateRange = cohort.dateRange;
      if (dateRange.startsWith('Last ')) {
        dateRange = dateRange.replace('Last ', '');
      }
      
      // Parse workflow step from stepId
      const workflowStep = cohort.stepId.replace('step-', '').replace(/-/g, ' ');
      const workflowStepFormatted = workflowStep
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ') || 'Maker';

      setFormData({
        name: cohort.name,
        description: cohort.description,
        dateRange: dateRange || '30 days',
        workflowStep: workflowStepFormatted || 'Maker',
        conditions: cohort.conditions || [
          {
            id: generateId(),
            metric: 'Tasks submitted',
            operator: 'is Greater than (>)',
            value: '',
            usePercentile: false,
          },
        ],
        logicalOperators: cohort.conditions && cohort.conditions.length > 1
          ? new Array(cohort.conditions.length - 1).fill('AND')
          : [],
      });
    }
  }, [cohort, open]);

  const handleAddCondition = () => {
    setFormData({
      ...formData,
      conditions: [
        ...formData.conditions,
        {
          id: generateId(),
          metric: 'Tasks submitted',
          operator: 'is Greater than (>)',
          value: '',
          usePercentile: false,
        },
      ],
      logicalOperators: [...formData.logicalOperators, 'AND'],
    });
  };

  const handleRemoveCondition = (conditionId: string) => {
    const conditionIndex = formData.conditions.findIndex((c) => c.id === conditionId);
    if (conditionIndex === -1) return;

    const newConditions = formData.conditions.filter((c) => c.id !== conditionId);
    const newLogicalOperators = [...formData.logicalOperators];
    if (conditionIndex > 0) {
      newLogicalOperators.splice(conditionIndex - 1, 1);
    }

    setFormData({
      ...formData,
      conditions: newConditions,
      logicalOperators: newLogicalOperators,
    });
  };

  const handleConditionChange = (
    conditionId: string,
    field: keyof CohortCondition,
    value: any
  ) => {
    setFormData({
      ...formData,
      conditions: formData.conditions.map((c) =>
        c.id === conditionId ? { ...c, [field]: value } : c
      ),
    });
  };

  const handleLogicalOperatorChange = (index: number, operator: LogicalOperator) => {
    const newOperators = [...formData.logicalOperators];
    newOperators[index] = operator;
    setFormData({
      ...formData,
      logicalOperators: newOperators,
    });
  };

  const handleSave = () => {
    if (!cohort) return;

    // Validation
    if (!formData.name.trim()) {
      toast({
        title: 'Validation error',
        description: 'Cohort name is required.',
        variant: 'destructive',
      });
      return;
    }

    if (formData.conditions.length === 0) {
      toast({
        title: 'Validation error',
        description: 'At least one condition is required.',
        variant: 'destructive',
      });
      return;
    }

    // Validate all conditions have values
    const invalidConditions = formData.conditions.filter(
      (c) => !c.value.trim()
    );
    if (invalidConditions.length > 0) {
      toast({
        title: 'Validation error',
        description: 'All conditions must have a value.',
        variant: 'destructive',
      });
      return;
    }

    onSave(cohort.id, formData);
    onOpenChange(false);

    toast({
      title: 'Cohort updated',
      description: 'The cohort has been updated successfully.',
    });
  };

  if (!cohort) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Cohort</DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border">
          <button
            onClick={() => setActiveTab('insights')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'insights'
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Insights
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'settings'
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Settings
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          {activeTab === 'insights' && (
            <>
              {/* General Settings */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>
                      Date range <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.dateRange}
                      onValueChange={(value) =>
                        setFormData({ ...formData, dateRange: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {dateRanges.map((range) => (
                          <SelectItem key={range} value={range}>
                            {range}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Workflow step <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.workflowStep}
                      onValueChange={(value) =>
                        setFormData({ ...formData, workflowStep: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {workflowSteps.map((step) => (
                          <SelectItem key={step} value={step}>
                            {step}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Conditions */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-4">
                    Set up conditions to automatically assign users
                  </h3>

                  <div className="space-y-4">
                    {formData.conditions.map((condition, index) => (
                      <div key={condition.id} className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Label className="text-xs">Condition by percentile</Label>
                            <Switch
                              checked={condition.usePercentile}
                              onCheckedChange={(checked) =>
                                handleConditionChange(condition.id, 'usePercentile', checked)
                              }
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <Select
                            value={condition.metric}
                            onValueChange={(value) =>
                              handleConditionChange(condition.id, 'metric', value as MetricType)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {metrics.map((metric) => (
                                <SelectItem key={metric} value={metric}>
                                  {metric}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Select
                            value={condition.operator}
                            onValueChange={(value) =>
                              handleConditionChange(condition.id, 'operator', value as OperatorType)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {operators.map((op) => (
                                <SelectItem key={op} value={op}>
                                  {op}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <div className="flex items-center gap-2">
                            <Input
                              value={condition.value}
                              onChange={(e) =>
                                handleConditionChange(condition.id, 'value', e.target.value)
                              }
                              placeholder={condition.usePercentile ? 'P5' : '50'}
                              className="flex-1"
                            />
                            {formData.conditions.length > 1 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-muted-foreground hover:text-destructive"
                                onClick={() => handleRemoveCondition(condition.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>

                        {index < formData.conditions.length - 1 && (
                          <RadioGroup
                            value={formData.logicalOperators[index] || 'AND'}
                            onValueChange={(value) =>
                              handleLogicalOperatorChange(index, value as LogicalOperator)
                            }
                            className="flex gap-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="AND" id={`and-${index}`} />
                              <Label htmlFor={`and-${index}`} className="cursor-pointer">
                                AND
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="OR" id={`or-${index}`} />
                              <Label htmlFor={`or-${index}`} className="cursor-pointer">
                                OR
                              </Label>
                            </div>
                          </RadioGroup>
                        )}
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    onClick={handleAddCondition}
                    className="mt-4"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Condition
                  </Button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>
                  Cohort name <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter cohort name"
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Enter cohort description"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

