import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from './StatusBadge';
import { format } from 'date-fns';
import { ChevronRight } from 'lucide-react';

interface Submission {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  service_type: string;
  message: string | null;
  status: string;
  created_at: string;
}

interface SubmissionsTableProps {
  submissions: Submission[];
}

export const SubmissionsTable = ({ submissions }: SubmissionsTableProps) => {
  if (submissions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No submissions found
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.map((submission) => (
            <TableRow key={submission.id} className="cursor-pointer hover:bg-gray-50">
              <TableCell>
                <Link 
                  to={`/admin/submissions/${submission.id}`}
                  className="font-medium text-foreground hover:underline"
                >
                  {submission.first_name} {submission.last_name}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {submission.email}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {submission.service_type}
              </TableCell>
              <TableCell>
                <StatusBadge status={submission.status || 'new'} />
              </TableCell>
              <TableCell className="text-muted-foreground">
                {format(new Date(submission.created_at), 'MMM d, yyyy')}
              </TableCell>
              <TableCell>
                <Link to={`/admin/submissions/${submission.id}`}>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
