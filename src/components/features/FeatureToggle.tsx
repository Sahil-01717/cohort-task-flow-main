import { Switch } from '@/components/ui/switch';
import { Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureToggleProps {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  onConfigure?: () => void;
  showSettings?: boolean;
  warning?: React.ReactNode;
  children?: React.ReactNode;
}

export function FeatureToggle({
  title,
  description,
  enabled,
  onToggle,
  onConfigure,
  showSettings = false,
  warning,
  children,
}: FeatureToggleProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-foreground">{title}</h3>
            {showSettings && enabled && onConfigure && (
              <button
                onClick={onConfigure}
                className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Configure feature"
              >
                <Settings2 className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={onToggle}
          className="flex-shrink-0"
        />
      </div>
      
      {warning && (
        <div className="animate-fade-in">
          {warning}
        </div>
      )}
      
      {enabled && children && (
        <div className={cn('pl-0 animate-fade-in', children && 'mt-4')}>
          {children}
        </div>
      )}
    </div>
  );
}
