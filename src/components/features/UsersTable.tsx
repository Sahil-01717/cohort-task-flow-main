import { UserPerformance } from '@/types/userPerformance';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface UsersTableProps {
  users: UserPerformance[];
}

type SortField = keyof UserPerformance | null;
type SortDirection = 'asc' | 'desc';

export function UsersTable({ users }: UsersTableProps) {
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: keyof UserPerformance) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    if (!sortField) return 0;
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    return 0;
  });

  const SortIcon = ({ field }: { field: keyof UserPerformance }) => {
    if (sortField !== field) {
      return (
        <div className="flex flex-col ml-1">
          <ChevronUp className="w-3 h-3 text-muted-foreground opacity-50" />
          <ChevronDown className="w-3 h-3 text-muted-foreground opacity-50 -mt-1" />
        </div>
      );
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-3 h-3 ml-1" />
    ) : (
      <ChevronDown className="w-3 h-3 ml-1" />
    );
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <button
                onClick={() => handleSort('email')}
                className="flex items-center hover:text-foreground"
              >
                EMAIL
                <SortIcon field="email" />
              </button>
            </TableHead>
            <TableHead>
              <button
                onClick={() => handleSort('tasksSubmitted')}
                className="flex items-center hover:text-foreground"
              >
                TASKS SUBMITTED
                <SortIcon field="tasksSubmitted" />
              </button>
            </TableHead>
            <TableHead>
              <button
                onClick={() => handleSort('tasksSkipped')}
                className="flex items-center hover:text-foreground"
              >
                TASKS SKIPPED
                <SortIcon field="tasksSkipped" />
              </button>
            </TableHead>
            <TableHead>
              <button
                onClick={() => handleSort('totalTimeTaken')}
                className="flex items-center hover:text-foreground"
              >
                TOTAL TIME TAKEN
                <SortIcon field="totalTimeTaken" />
              </button>
            </TableHead>
            <TableHead>
              <button
                onClick={() => handleSort('avgHandlingTime')}
                className="flex items-center hover:text-foreground"
              >
                AVG. HANDLING TIME
                <SortIcon field="avgHandlingTime" />
              </button>
            </TableHead>
            <TableHead>
              <button
                onClick={() => handleSort('tasksRejected')}
                className="flex items-center hover:text-foreground"
              >
                TASKS REJECTED
                <SortIcon field="tasksRejected" />
              </button>
            </TableHead>
            <TableHead>
              <button
                onClick={() => handleSort('tasksAccepted')}
                className="flex items-center hover:text-foreground"
              >
                TASK ACCE
                <SortIcon field="tasksAccepted" />
              </button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedUsers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            sortedUsers.map((user) => (
              <TableRow key={user.email}>
                <TableCell className="font-medium">{user.email}</TableCell>
                <TableCell>{user.tasksSubmitted}</TableCell>
                <TableCell>{user.tasksSkipped}</TableCell>
                <TableCell>{formatTime(user.totalTimeTaken)}</TableCell>
                <TableCell>{user.avgHandlingTime.toFixed(1)}m</TableCell>
                <TableCell>{user.tasksRejected}</TableCell>
                <TableCell>{user.tasksAccepted}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

