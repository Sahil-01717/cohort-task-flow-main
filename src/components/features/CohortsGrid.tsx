import { Cohort } from '@/types/cohort';
import { Users, Calendar, Pencil, Archive, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CohortsGridProps {
  cohorts: Cohort[];
  onEdit?: (cohort: Cohort) => void;
  onArchive?: (cohort: Cohort) => void;
  onDownload?: (cohort: Cohort) => void;
  canEdit?: boolean; // Whether cohorts can be edited (false for archived)
}

export function CohortsGrid({
  cohorts,
  onEdit,
  onArchive,
  onDownload,
  canEdit = true,
}: CohortsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cohorts.map((cohort) => (
        <div
          key={cohort.id}
          className="p-4 rounded-lg border bg-card hover:border-primary/30 transition-all"
        >
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-foreground line-clamp-2 flex-1">
              {cohort.name}
            </h3>
            <div className="flex items-center gap-1 ml-2 flex-shrink-0">
              {canEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={() => onEdit?.(cohort)}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
              )}
              {canEdit ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => onArchive?.(cohort)}
                >
                  <Archive className="w-3.5 h-3.5" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-primary"
                  onClick={() => onArchive?.(cohort)}
                  title="Unarchive"
                >
                  <Archive className="w-3.5 h-3.5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={() => onDownload?.(cohort)}
              >
                <Download className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {cohort.description}
          </p>
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>{cohort.memberCount} {cohort.memberType}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{cohort.dateRange}</span>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Updated {cohort.updatedAt}
          </p>
        </div>
      ))}
    </div>
  );
}

