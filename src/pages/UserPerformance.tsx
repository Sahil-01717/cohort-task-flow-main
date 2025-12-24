import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Download, Filter, ChevronDown } from 'lucide-react';
import { UsersTable } from '@/components/features/UsersTable';
import { CohortsGrid } from '@/components/features/CohortsGrid';
import { CreateCohortModal } from '@/components/features/CreateCohortModal';
import { EditCohortModal } from '@/components/features/EditCohortModal';
import { mockUserPerformance } from '@/data/mockUserPerformance';
import { mockCohorts } from '@/data/mockCohorts';
import { UserPerformanceFilters } from '@/types/userPerformance';
import { Cohort, CohortFormData } from '@/types/cohort';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

type TabType = 'users' | 'cohorts';
type CohortStatusTab = 'live' | 'archived';

export function UserPerformance() {
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const [cohortStatusTab, setCohortStatusTab] = useState<CohortStatusTab>('live');
  const [cohorts, setCohorts] = useState<Cohort[]>(mockCohorts || []);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCohort, setEditingCohort] = useState<Cohort | null>(null);
  
  const [filters, setFilters] = useState<UserPerformanceFilters>({
    role: 'Maker',
    dateRange: 'Last 30 days',
    batch: 'All batches',
    searchEmail: '',
  });

  // Filter users based on search
  const filteredUsers = (mockUserPerformance || []).filter((user) =>
    user.email.toLowerCase().includes(filters.searchEmail.toLowerCase())
  );

  // Filter cohorts by status
  const liveCohorts = cohorts.filter((c) => c.status === 'live');
  const archivedCohorts = cohorts.filter((c) => c.status === 'archived');
  const displayedCohorts = cohortStatusTab === 'live' ? liveCohorts : archivedCohorts;

  const handleExportCSV = () => {
    toast({
      title: 'Export started',
      description: 'CSV export will be downloaded shortly.',
    });
    // CSV export logic would go here
  };

  const handleFilterMembers = () => {
    toast({
      title: 'Filters applied',
      description: 'User filters have been updated.',
    });
  };

  const handleCreateCohort = () => {
    setShowCreateModal(true);
  };

  const handleSaveNewCohort = (data: CohortFormData) => {
    // Generate new cohort ID
    const newId = `cohort-${Date.now()}`;
    
    // Convert workflow step to stepId format
    const stepId = `step-${data.workflowStep.toLowerCase().replace(/\s+/g, '-')}`;
    
    // Convert date range format
    const dateRangeFormatted = data.dateRange === 'All time' 
      ? 'All time' 
      : `Last ${data.dateRange}`;
    
    // Determine member type from workflow step
    const memberType: 'Makers' | 'Reviewer' = 
      data.workflowStep === 'Reviewer' ? 'Reviewer' : 'Makers';

    const newCohort: Cohort = {
      id: newId,
      name: data.name,
      description: data.description || `Cohort based on ${data.conditions.length} condition(s)`,
      memberCount: 0, // Will be calculated
      memberType,
      dateRange: dateRangeFormatted,
      updatedAt: 'Just now',
      status: 'live',
      stepId,
      conditions: data.conditions,
    };

    setCohorts([...cohorts, newCohort]);
    toast({
      title: 'Cohort created',
      description: `Cohort "${data.name}" has been created successfully.`,
    });
  };

  const handleEditCohort = (cohort: Cohort) => {
    if (cohort.status === 'archived') {
      toast({
        title: 'Cannot edit archived cohort',
        description: 'Archived cohorts cannot be edited.',
        variant: 'destructive',
      });
      return;
    }
    setEditingCohort(cohort);
    setShowEditModal(true);
  };

  const handleSaveEditCohort = (cohortId: string, data: CohortFormData) => {
    const stepId = `step-${data.workflowStep.toLowerCase().replace(/\s+/g, '-')}`;
    const dateRangeFormatted = data.dateRange === 'All time' 
      ? 'All time' 
      : `Last ${data.dateRange}`;
    const memberType: 'Makers' | 'Reviewer' = 
      data.workflowStep === 'Reviewer' ? 'Reviewer' : 'Makers';

    setCohorts(
      cohorts.map((c) =>
        c.id === cohortId
          ? {
              ...c,
              name: data.name,
              description: data.description || c.description,
              dateRange: dateRangeFormatted,
              stepId,
              memberType,
              conditions: data.conditions,
              updatedAt: 'Just now',
            }
          : c
      )
    );
    setShowEditModal(false);
    setEditingCohort(null);
  };

  const handleArchiveCohort = (cohort: Cohort) => {
    if (cohort.status === 'live') {
      // Archive the cohort
      setCohorts(
        cohorts.map((c) =>
          c.id === cohort.id ? { ...c, status: 'archived' as const } : c
        )
      );
      toast({
        title: 'Cohort archived',
        description: `Cohort "${cohort.name}" has been archived.`,
      });
    } else {
      // Unarchive the cohort
      setCohorts(
        cohorts.map((c) =>
          c.id === cohort.id ? { ...c, status: 'live' as const } : c
        )
      );
      toast({
        title: 'Cohort unarchived',
        description: `Cohort "${cohort.name}" has been unarchived.`,
      });
      // Switch to live tab if viewing archived
      if (cohortStatusTab === 'archived') {
        setCohortStatusTab('live');
      }
    }
  };

  const handleDownloadCohort = (cohort: Cohort) => {
    toast({
      title: 'Download cohort',
      description: `Downloading data for: ${cohort.name}`,
    });
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground mb-2">User performance</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-border">
          <button
            onClick={() => setActiveTab('users')}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'users'
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('cohorts')}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'cohorts'
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            Cohorts
          </button>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Filters and Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Select
                  value={filters.role}
                  onValueChange={(value) => setFilters({ ...filters, role: value })}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Maker">Maker</SelectItem>
                    <SelectItem value="Reviewer">Reviewer</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-1">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-medium">
                    R
                  </div>
                  <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground text-xs font-medium">
                    S
                  </div>
                </div>
              </div>

              <Select
                value={filters.dateRange}
                onValueChange={(value) => setFilters({ ...filters, dateRange: value })}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Last 7 days">Last 7 days</SelectItem>
                  <SelectItem value="Last 15 days">Last 15 days</SelectItem>
                  <SelectItem value="Last 30 days">Last 30 days</SelectItem>
                  <SelectItem value="Last 60 days">Last 60 days</SelectItem>
                  <SelectItem value="All time">All time</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.batch}
                onValueChange={(value) => setFilters({ ...filters, batch: value })}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All batches">All batches</SelectItem>
                  <SelectItem value="Batch 1">Batch 1</SelectItem>
                  <SelectItem value="Batch 2">Batch 2</SelectItem>
                </SelectContent>
              </Select>

              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email"
                  value={filters.searchEmail}
                  onChange={(e) => setFilters({ ...filters, searchEmail: e.target.value })}
                  className="pl-9"
                />
              </div>

              <Button variant="outline" onClick={handleFilterMembers}>
                <Filter className="w-4 h-4 mr-2" />
                Filter Members
              </Button>

              <div className="ml-auto flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Last upd</span>
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-medium">
                  R
                </div>
              </div>

              <Button variant="outline" onClick={handleExportCSV}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>

            {/* Users Table */}
            <UsersTable users={filteredUsers} />

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Total {filteredUsers.length} items</p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled>
                  &lt;
                </Button>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((page) => (
                    <Button
                      key={page}
                      variant={page === 1 ? 'default' : 'outline'}
                      size="sm"
                      className="w-8 h-8"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button variant="outline" size="sm">
                  &gt;
                </Button>
                <Select defaultValue="10">
                  <SelectTrigger className="w-[100px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10/page</SelectItem>
                    <SelectItem value="25">25/page</SelectItem>
                    <SelectItem value="50">50/page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Cohorts Tab */}
        {activeTab === 'cohorts' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Segment contributors based on performance metrics and conditions
              </p>
              <Button onClick={handleCreateCohort}>
                Create New Cohort
              </Button>
            </div>

            {/* Live/Archived Tabs */}
            <div className="flex gap-2 border-b border-border">
              <button
                onClick={() => setCohortStatusTab('live')}
                className={cn(
                  'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                  cohortStatusTab === 'live'
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                Live
              </button>
              <button
                onClick={() => setCohortStatusTab('archived')}
                className={cn(
                  'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                  cohortStatusTab === 'archived'
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                Archived
              </button>
            </div>

            <CohortsGrid
              cohorts={displayedCohorts}
              onEdit={handleEditCohort}
              onArchive={handleArchiveCohort}
              onDownload={handleDownloadCohort}
              canEdit={cohortStatusTab === 'live'}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateCohortModal
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
          onSave={handleSaveNewCohort}
        />
      )}

      {showEditModal && editingCohort && (
        <EditCohortModal
          open={showEditModal}
          onOpenChange={(open) => {
            setShowEditModal(open);
            if (!open) setEditingCohort(null);
          }}
          cohort={editingCohort}
          onSave={handleSaveEditCohort}
        />
      )}
    </div>
  );
}

