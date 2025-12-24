import { Cohort } from '@/types/cohort';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QCSamplingCohortCardProps {
  cohort: Cohort;
  samplingPercentage: number;
  onPercentageChange: (percentage: number) => void;
  onRemove: () => void;
  isArchived?: boolean;
}

export function QCSamplingCohortCard({
  cohort,
  samplingPercentage,
  onPercentageChange,
  onRemove,
  isArchived = false,
}: QCSamplingCohortCardProps) {
  return (
    <div
      className={cn(
        'p-4 rounded-lg border transition-all',
        isArchived
          ? 'border-warning/50 bg-warning/5'
          : 'border-border bg-card hover:border-primary/30'
      )}
    >
      {isArchived && (
        <div className="flex items-center gap-2 text-warning mb-3 pb-3 border-b border-warning/20">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm font-medium">
            This cohort has been archived
          </span>
        </div>
      )}
      
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-foreground truncate">{cohort.name}</h4>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {cohort.description}
          </p>
          
          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
            <span>{cohort.memberCount} {cohort.memberType}</span>
            <span>{cohort.dateRange}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex flex-col items-end gap-1">
            <label className="text-xs text-muted-foreground">Sampling %</label>
            <Input
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={samplingPercentage || ''}
              onChange={(e) => onPercentageChange(parseFloat(e.target.value) || 0)}
              className="w-24 h-9 text-center"
              placeholder="0"
            />
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

