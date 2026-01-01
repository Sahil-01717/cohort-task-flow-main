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
  ConditionGroup,
  LogicalOperator,
  MetricType,
  OperatorType,
} from '@/types/cohort';
import { Plus, X, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface EditCohortModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cohort: Cohort | null;
  onSave: (cohortId: string, data: CohortFormData) => void;
}

const allMetrics: MetricType[] = [
  'Tasks submitted',
  'Tasks skipped',
  'Tasks rejected',
  'Tasks accepted',
  'Total time taken',
  'Avg. handling time',
  'Review Acceptance Rate',
  'QC Pass Rate',
];

// Get available metrics based on workflow step
const getAvailableMetrics = (step: string): MetricType[] => {
  const commonMetrics: MetricType[] = [
    'Tasks submitted',
    'Tasks skipped',
    'Tasks rejected',
    'Tasks accepted',
    'Total time taken',
    'Avg. handling time',
  ];
  
  if (step === 'Maker') {
    return [...commonMetrics, 'Review Acceptance Rate'];
  } else if (step === 'Reviewer' || step === 'Rework') {
    return [...commonMetrics, 'QC Pass Rate'];
  } else {
    // Quality Check or other steps - no quality metrics
    return commonMetrics;
  }
};

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
const generateId = () => `id-${Date.now()}-${++idCounter}`;
const generateGroupId = () => `group-${Date.now()}-${++idCounter}`;

// Convert old format (conditions array) to new format (conditionGroups)
const convertConditionsToGroups = (conditions: CohortCondition[]): ConditionGroup[] => {
  if (!conditions || conditions.length === 0) {
    return [
      {
        id: generateGroupId(),
        operator: 'AND',
        conditions: [
          {
            id: generateId(),
            metric: 'Tasks submitted',
            operator: 'is Greater than (>)',
            value: '',
            usePercentile: false,
          },
        ],
      },
    ];
  }

  // Convert conditions, handling percentile conversion for backward compatibility
  const convertedConditions = conditions.map((c) => {
    const condition = {
      ...c,
      id: c.id || generateId(),
    };

    // Percentile notation (P5, P95, etc.) is already in the correct format
    // No conversion needed - operators are the same for both absolute and percentile

    return condition;
  });

  // For now, convert all conditions into a single group with AND operator
  // This maintains backward compatibility
  return [
    {
      id: generateGroupId(),
      operator: 'AND',
      conditions: convertedConditions,
    },
  ];
};

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
    conditionGroups: [
      {
        id: generateGroupId(),
        operator: 'AND',
        conditions: [
          {
            id: generateId(),
            metric: 'Tasks submitted',
            operator: 'is Greater than (>)',
            value: '',
            usePercentile: false,
          },
        ],
      },
    ],
    groupConnector: 'AND',
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

      // Convert conditions to conditionGroups
      const conditionGroups = convertConditionsToGroups(cohort.conditions || []);

      setFormData({
        name: cohort.name,
        description: cohort.description,
        dateRange: dateRange || '30 days',
        workflowStep: workflowStepFormatted || 'Maker',
        conditionGroups,
        groupConnector: 'AND',
      });
    }
  }, [cohort, open]);

  // Add a new condition to a specific group
  const handleAddCondition = (groupId: string) => {
    setFormData({
      ...formData,
      conditionGroups: formData.conditionGroups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              conditions: [
                ...group.conditions,
                {
                  id: generateId(),
                  metric: 'Tasks submitted',
                  operator: 'is Greater than (>)',
                  value: '',
                  usePercentile: false,
                },
              ],
            }
          : group
      ),
    });
  };

  // Add a new group
  const handleAddGroup = () => {
    setFormData({
      ...formData,
      conditionGroups: [
        ...formData.conditionGroups,
        {
          id: generateGroupId(),
          operator: 'AND',
          conditions: [
            {
              id: generateId(),
              metric: 'Tasks submitted',
              operator: 'is Greater than (>)',
              value: '',
              usePercentile: false,
            },
          ],
        },
      ],
    });
  };

  // Remove a condition from a group
  const handleRemoveCondition = (groupId: string, conditionId: string) => {
    setFormData({
      ...formData,
      conditionGroups: formData.conditionGroups.map((group) => {
        if (group.id === groupId) {
          const newConditions = group.conditions.filter((c) => c.id !== conditionId);
          // If group becomes empty, remove the group
          if (newConditions.length === 0) {
            return null;
          }
          return { ...group, conditions: newConditions };
        }
        return group;
      }).filter((group): group is ConditionGroup => group !== null),
    });
  };

  // Remove a group
  const handleRemoveGroup = (groupId: string) => {
    const newGroups = formData.conditionGroups.filter((g) => g.id !== groupId);
    // Ensure at least one group exists
    if (newGroups.length === 0) {
      setFormData({
        ...formData,
        conditionGroups: [
          {
            id: generateGroupId(),
            operator: 'AND',
            conditions: [
              {
                id: generateId(),
                metric: 'Tasks submitted',
                operator: 'is Greater than (>)',
                value: '',
                usePercentile: false,
              },
            ],
          },
        ],
      });
    } else {
      setFormData({
        ...formData,
        conditionGroups: newGroups,
      });
    }
  };

  // Update a condition within a group
  const handleConditionChange = (
    groupId: string,
    conditionId: string,
    field: keyof CohortCondition,
    value: any
  ) => {
    setFormData({
      ...formData,
      conditionGroups: formData.conditionGroups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              conditions: group.conditions.map((c) => {
                if (c.id === conditionId) {
                  const updated = { ...c, [field]: value };
                  
                  // When switching between percentile and absolute modes, reset operator
                  if (field === 'usePercentile') {
                    if (value) {
                      // Switching to percentile mode - set default percentile operator
                      updated.operator = 'is in top X%';
                      updated.value = ''; // Clear value
                    } else {
                      // Switching to absolute mode - set default absolute operator
                      updated.operator = 'is Greater than (>)';
                      updated.value = ''; // Clear value
                    }
                  }
                  
                  return updated;
                }
                return c;
              }),
            }
          : group
      ),
    });
  };

  // Update group operator
  const handleGroupOperatorChange = (groupId: string, operator: LogicalOperator) => {
    setFormData({
      ...formData,
      conditionGroups: formData.conditionGroups.map((group) =>
        group.id === groupId ? { ...group, operator } : group
      ),
    });
  };

  // Update group connector
  const handleGroupConnectorChange = (connector: LogicalOperator) => {
    setFormData({
      ...formData,
      groupConnector: connector,
    });
  };

  // Get total condition count for validation
  const getTotalConditionCount = () => {
    return formData.conditionGroups.reduce((sum, group) => sum + group.conditions.length, 0);
  };

  // Generate preview text
  const getPreviewText = () => {
    if (formData.conditionGroups.length === 0) return '';

    const groupTexts = formData.conditionGroups.map((group, index) => {
      const conditionCount = group.conditions.length;
      return `Group ${index + 1} (${group.operator})`;
    });

    if (groupTexts.length === 1) {
      return groupTexts[0];
    }

    return groupTexts.join(` ${formData.groupConnector} `);
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

    const totalConditions = getTotalConditionCount();
    if (totalConditions === 0) {
      toast({
        title: 'Validation error',
        description: 'At least one condition is required.',
        variant: 'destructive',
      });
      return;
    }

    // Validate all conditions have values
    const invalidConditions = formData.conditionGroups.some((group) =>
      group.conditions.some((c) => {
        if (!c.value.trim()) return true;
        // Validate percentile notation (P5, P25, P95, etc.)
        if (c.usePercentile) {
          const percentileMatch = c.value.match(/^P(\d+)$/i);
          if (!percentileMatch) return true;
          const percentile = parseInt(percentileMatch[1], 10);
          if (isNaN(percentile) || percentile < 0 || percentile > 100) return true;
        }
        return false;
      })
    );
    if (invalidConditions) {
      toast({
        title: 'Validation error',
        description: 'All conditions must have a valid value. Percentile values must be in format P5, P25, P95, etc. (0-100).',
        variant: 'destructive',
      });
      return;
    }

    // Remove empty groups before saving
    const cleanedGroups = formData.conditionGroups.filter(
      (group) => group.conditions.length > 0
    );

    onSave(cohort.id, {
      ...formData,
      conditionGroups: cleanedGroups,
    });
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
                      onValueChange={(value) => {
                        const availableMetrics = getAvailableMetrics(value);
                        // Reset any conditions with metrics not available for the new step
                        const updatedGroups = formData.conditionGroups.map((group) => ({
                          ...group,
                          conditions: group.conditions.map((condition) => {
                            if (!availableMetrics.includes(condition.metric)) {
                              return {
                                ...condition,
                                metric: availableMetrics[0] || 'Tasks submitted',
                              };
                            }
                            return condition;
                          }),
                        }));
                        setFormData({ ...formData, workflowStep: value, conditionGroups: updatedGroups });
                      }}
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

                  <div className="space-y-6">
                    {formData.conditionGroups.map((group, groupIndex) => (
                      <div key={group.id} className="space-y-4">
                        {/* Group Header */}
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium">
                              Group {groupIndex + 1}
                            </span>
                            <Select
                              value={group.operator}
                              onValueChange={(value) =>
                                handleGroupOperatorChange(group.id, value as LogicalOperator)
                              }
                            >
                              <SelectTrigger className="w-24 h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="AND">AND</SelectItem>
                                <SelectItem value="OR">OR</SelectItem>
                              </SelectContent>
                            </Select>
                            <span className="text-xs text-muted-foreground">
                              (within group)
                            </span>
                          </div>
                          {formData.conditionGroups.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => handleRemoveGroup(group.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>

                        {/* Conditions in Group */}
                        <div className="space-y-3 pl-4 border-l-2 border-border">
                          {group.conditions.map((condition) => (
                            <div key={condition.id} className="space-y-3">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                  <Label className="text-xs">Condition by percentile</Label>
                                  <Switch
                                    checked={condition.usePercentile}
                                    onCheckedChange={(checked) =>
                                      handleConditionChange(
                                        group.id,
                                        condition.id,
                                        'usePercentile',
                                        checked
                                      )
                                    }
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-3 gap-3">
                                <Select
                                  value={condition.metric}
                                  onValueChange={(value) =>
                                    handleConditionChange(
                                      group.id,
                                      condition.id,
                                      'metric',
                                      value as MetricType
                                    )
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {getAvailableMetrics(formData.workflowStep).map((metric) => (
                                      <SelectItem key={metric} value={metric}>
                                        {metric}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>

                                <Select
                                  value={condition.operator}
                                  onValueChange={(value) =>
                                    handleConditionChange(
                                      group.id,
                                      condition.id,
                                      'operator',
                                      value as OperatorType
                                    )
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

                                <div className="flex flex-col gap-2">
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="text"
                                      value={condition.value}
                                      onChange={(e) =>
                                        handleConditionChange(
                                          group.id,
                                          condition.id,
                                          'value',
                                          e.target.value
                                        )
                                      }
                                      placeholder={
                                        condition.usePercentile
                                          ? 'P5, P25, P95, etc.'
                                          : '50'
                                      }
                                      className="flex-1"
                                    />
                                    {group.conditions.length > 1 && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 text-muted-foreground hover:text-destructive"
                                        onClick={() =>
                                          handleRemoveCondition(group.id, condition.id)
                                        }
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    )}
                                  </div>
                                  {condition.usePercentile && condition.value && (
                                    <p className="text-xs text-muted-foreground">
                                      Enter percentile notation (e.g., P5, P25, P95). P5 = 5th percentile, P95 = 95th percentile.
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Add Condition to Group Button */}
                        <div className="pl-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddCondition(group.id)}
                            className="w-full"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Condition to Group {groupIndex + 1}
                          </Button>
                        </div>

                        {/* Group Connector (between groups) */}
                        {groupIndex < formData.conditionGroups.length - 1 && (
                          <div className="flex items-center justify-center py-2">
                            <div className="flex items-center gap-3 px-4 py-2 bg-background border border-border rounded-lg">
                              <span className="text-sm text-muted-foreground">
                                Connect groups with:
                              </span>
                              <RadioGroup
                                value={formData.groupConnector}
                                onValueChange={(value) =>
                                  handleGroupConnectorChange(value as LogicalOperator)
                                }
                                className="flex gap-4"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="AND" id={`connector-and-${groupIndex}`} />
                                  <Label
                                    htmlFor={`connector-and-${groupIndex}`}
                                    className="cursor-pointer"
                                  >
                                    AND
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="OR" id={`connector-or-${groupIndex}`} />
                                  <Label
                                    htmlFor={`connector-or-${groupIndex}`}
                                    className="cursor-pointer"
                                  >
                                    OR
                                  </Label>
                                </div>
                              </RadioGroup>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add New Group Button */}
                  <Button
                    variant="outline"
                    onClick={handleAddGroup}
                    className="mt-4"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Group
                  </Button>

                  {/* Visual Preview */}
                  {getTotalConditionCount() > 0 && (
                    <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-border">
                      <div className="text-xs text-muted-foreground mb-1">Preview:</div>
                      <div className="text-sm font-medium text-foreground">
                        {getPreviewText()}
                      </div>
                    </div>
                  )}
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
