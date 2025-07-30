
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from './ui/button';
import { ArrowUpDown } from 'lucide-react';

type ReportData = {
  name: string;
  total: number;
}[];

type SortColumn = 'name' | 'total';

type ReportTableProps = {
  data: ReportData;
  onSort: (column: SortColumn) => void;
  sortColumn: SortColumn;
  sortDirection: 'asc' | 'desc';
};

export function ReportTable({ data, onSort, sortColumn, sortDirection }: ReportTableProps) {
  if (!data || data.length === 0) {
    return null;
  }

  const renderSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) {
        return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortDirection === 'asc' ? (
        <ArrowUpDown className="ml-2 h-4 w-4" />
    ) : (
        <ArrowUpDown className="ml-2 h-4 w-4" />
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Report Data</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border bg-card shadow-sm">
            <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>
                        <Button variant="ghost" onClick={() => onSort('name')}>
                            Status
                            {renderSortIcon('name')}
                        </Button>
                    </TableHead>
                    <TableHead>
                         <Button variant="ghost" onClick={() => onSort('total')}>
                            Total
                            {renderSortIcon('total')}
                        </Button>
                    </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((row) => (
                    <TableRow key={row.name}>
                        <TableCell className="font-medium">{row.name}</TableCell>
                        <TableCell>{row.total}</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
