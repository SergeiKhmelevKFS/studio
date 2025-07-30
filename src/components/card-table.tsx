'use client';

import type { CardRecord } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Badge } from './ui/badge';
import { format } from 'date-fns';

type CardTableProps = {
  records: CardRecord[];
  onEdit: (record: CardRecord) => void;
  onDelete: (record: CardRecord) => void;
};

export function CardTable({ records, onEdit, onDelete }: CardTableProps) {
  return (
    <div className="rounded-lg border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Staff ID</TableHead>
            <TableHead>Company</TableHead>
            <TableHead className="hidden md:table-cell">Cardholder</TableHead>
            <TableHead className="hidden lg:table-cell">
              Card Number
            </TableHead>
            <TableHead className="hidden sm:table-cell">Expires</TableHead>
            <TableHead className="hidden sm:table-cell">Status</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.length > 0 ? (
            records.map((record) => {
              const isExpired = new Date() > record.expires;
              return (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.staffId}</TableCell>
                  <TableCell>{record.companyName}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {record.primaryCardholderName}
                  </TableCell>
                  <TableCell className="hidden font-mono lg:table-cell">
                    {record.primaryCardNumberBarcode}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {format(record.expires, 'MMM yyyy')}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant={isExpired ? 'destructive' : 'secondary'}>
                      {isExpired ? 'Expired' : 'Active'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(record)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(record)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No records found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
