import { useState } from 'react';
import { Cohort } from '@/types/cohort';
import { Check, Search, Users, Calendar, Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CohortSelectorProps {
  cohorts: Cohort[];
  selectedIds: string[];
  onSelect: (cohortId: string, dailyLimit: number) => void;
  onClose: () => void;
}

export function CohortSelector({
  cohorts,
  selectedIds,
  onSelect,
  onClose,
}: CohortSelectorProps) {
  const [search, setSearch] = useState('');
  const [expandedCohort, setExpandedCohort] = useState<string | null>(null);
  const [limitInputs, setLimitInputs] = useState<Record<string, number>>({});

  const filteredCohorts = cohorts.filter(
    (cohort) =>
      cohort.status === 'live' &&
      cohort.name.toLowerCase().includes(search.toLowerCase())
  );

  const availableCohorts = filteredCohorts.filter(
    (cohort) => !selectedIds.includes(cohort.id)
  );

  const handleCohortClick = (cohortId: string) => {
    if (expandedCohort === cohortId) {
      setExpandedCohort(null);
    } else {
      setExpandedCohort(cohortId);
      if (!limitInputs[cohortId]) {
        setLimitInputs((prev) => ({ ...prev, [cohortId]: 10 }));
      }
    }
  };

  const handleAddCohort = (cohortId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const limit = limitInputs[cohortId] || 10;
    if (limit < 1) {
      return;
    }
    onSelect(cohortId, limit);
    setExpandedCohort(null);
    setLimitInputs((prev) => {
      const newState = { ...prev };
      delete newState[cohortId];
      return newState;
    });
  };

  const handleLimitChange = (cohortId: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setLimitInputs((prev) => ({ ...prev, [cohortId]: numValue }));
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search cohorts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="max-h-64 overflow-y-auto space-y-2 scrollbar-thin">
        {availableCohorts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No available cohorts found</p>
            <p className="text-sm mt-1">
              {search ? 'Try a different search term' : 'All cohorts are already linked'}
            </p>
          </div>
        ) : (
          availableCohorts.map((cohort) => {
            const isExpanded = expandedCohort === cohort.id;
            const limit = limitInputs[cohort.id] || 10;
            const isValidLimit = limit >= 1;

            return (
              <div
                key={cohort.id}
                className={cn(
                  'rounded-lg border transition-all',
                  isExpanded
                    ? 'border-primary/50 bg-accent/50'
                    : 'border-border bg-card hover:border-primary/30'
                )}
              >
                <button
                  onClick={() => handleCohortClick(cohort.id)}
                  className="w-full p-3 text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate">
                        {cohort.name}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                        {cohort.description}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{cohort.memberCount} {cohort.memberType}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{cohort.dateRange}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {isExpanded ? (
                        <X className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Plus className="w-4 h-4 text-primary" />
                      )}
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-3 pb-3 pt-0 border-t border-border mt-2">
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex-1">
                        <label className="text-sm font-medium text-foreground block mb-1.5">
                          Daily Task Limit
                        </label>
                        <Input
                          type="number"
                          min={1}
                          max={1000}
                          value={limit || ''}
                          onChange={(e) => handleLimitChange(cohort.id, e.target.value)}
                          className="w-full"
                          placeholder="Enter limit"
                          onClick={(e) => e.stopPropagation()}
                        />
                        {!isValidLimit && limit !== 0 && (
                          <p className="text-xs text-destructive mt-1">
                            Limit must be at least 1
                          </p>
                        )}
                      </div>
                      <div className="flex items-end">
                        <Button
                          onClick={(e) => handleAddCohort(cohort.id, e)}
                          disabled={!isValidLimit}
                          size="sm"
                          className="h-9"
                        >
                          <Plus className="w-4 h-4 mr-1.5" />
                          Link
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="flex justify-end pt-2 border-t border-border">
        <Button variant="outline" onClick={onClose}>
          Done
        </Button>
      </div>
    </div>
  );
}
