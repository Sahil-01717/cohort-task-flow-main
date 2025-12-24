import { Contributor } from '@/types/cohort';
import { Info } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ContributorTableProps {
  contributors: Contributor[];
}

export function ContributorTable({ contributors }: ContributorTableProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>CONTRIBUTOR EMAIL ID</TableHead>
            <TableHead>
              <div className="flex items-center gap-1">
                COMPLETED JOBS
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-muted-foreground hover:text-foreground">
                      <Info className="w-3.5 h-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Total number of jobs completed by this contributor</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TableHead>
            <TableHead>
              <div className="flex items-center gap-1">
                SAMPLED TASKS
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-muted-foreground hover:text-foreground">
                      <Info className="w-3.5 h-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Number of tasks that have been sampled for QC</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TableHead>
            <TableHead>QC SAMPLING %</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contributors.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                No contributors found
              </TableCell>
            </TableRow>
          ) : (
            contributors.map((contributor) => (
              <TableRow key={contributor.email}>
                <TableCell className="font-medium">{contributor.email}</TableCell>
                <TableCell>{contributor.completedJobs}</TableCell>
                <TableCell>{contributor.sampledTasks}</TableCell>
                <TableCell className="font-medium">
                  {contributor.samplingPercentage.toFixed(1)}%
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

