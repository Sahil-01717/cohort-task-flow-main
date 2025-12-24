import { cn } from '@/lib/utils';
import {
  Activity,
  Settings2,
  Briefcase,
  Users,
  FlaskConical,
  BarChart3,
  ChevronDown,
  ArrowLeft,
} from 'lucide-react';

interface SidebarProps {
  activeItem: string;
  onItemClick: (item: string) => void;
}

const menuItems = [
  { id: 'activity', label: 'Activity Center', icon: Activity },
  { id: 'workflow', label: 'Workflow Settings', icon: Settings2 },
  { id: 'step', label: 'Step Settings', icon: Settings2, variant: 'bolt' },
  { id: 'job', label: 'Job Management', icon: Briefcase },
  { id: 'user', label: 'User Management', icon: Users },
  { id: 'quality', label: 'Quality Lab', icon: FlaskConical },
  { id: 'performance', label: 'User Performance', icon: BarChart3 },
];

const workflowSteps = [
  { id: 'maker', label: 'Maker' },
  { id: 'reviewer', label: 'Reviewer' },
  { id: 'qc', label: 'Quality Check' },
  { id: 'rework', label: 'Rework' },
];

export function Sidebar({ activeItem, onItemClick }: SidebarProps) {
  return (
    <aside className="w-60 bg-sidebar border-r border-sidebar-border flex flex-col h-screen">
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">T</span>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">TELUS Digital</p>
            <p className="text-sm font-medium text-sidebar-foreground">FT Studio Console</p>
          </div>
        </div>
      </div>

      {/* Back link */}
      <div className="px-4 py-3 border-b border-sidebar-border">
        <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Project Details
        </button>
      </div>

      {/* Project name */}
      <div className="px-4 py-3 border-b border-sidebar-border">
        <h2 className="font-semibold text-foreground">Amazon NOVA Project</h2>
        <button className="flex items-center gap-1 mt-2 px-3 py-1.5 bg-muted rounded-md text-sm text-muted-foreground hover:bg-accent transition-colors w-full">
          <span className="truncate">2 Turn - Conversation</span>
          <ChevronDown className="w-4 h-4 ml-auto flex-shrink-0" />
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 py-2 overflow-y-auto scrollbar-thin">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onItemClick(item.id)}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
              activeItem === item.id
                ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
            )}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Workflow steps (shown when step settings active) */}
      {activeItem === 'step' && (
        <div className="absolute left-60 top-0 h-full w-40 bg-card border-r border-border flex flex-col items-center justify-center gap-2 py-8">
          {workflowSteps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center">
              <button
                className={cn(
                  'px-6 py-2.5 rounded-lg border text-sm font-medium transition-colors',
                  step.id === 'maker'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card text-muted-foreground border-border hover:border-primary/50'
                )}
              >
                {step.label}
              </button>
              {index < workflowSteps.length - 1 && (
                <div className="w-px h-4 bg-border my-1" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* User */}
      <div className="p-4 border-t border-sidebar-border">
        <button className="flex items-center gap-2 w-full text-sm text-sidebar-foreground hover:text-foreground transition-colors">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium">
            S
          </div>
          <span className="flex-1 text-left truncate">Sahil Choudhary</span>
          <ChevronDown className="w-4 h-4 flex-shrink-0" />
        </button>
      </div>
    </aside>
  );
}
