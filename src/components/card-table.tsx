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
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { Badge } from './ui/badge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

type CardTableProps = {
  records: CardRecord[];
  onEdit: (record: CardRecord) => void;
};

export function CardTable({ records, onEdit }: CardTableProps) {
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
              const isActive = record.active && !isExpired;
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
                    <Badge variant={isActive ? 'default' : 'destructive'} className={cn(isActive && 'bg-green-500 hover:bg-green-500/80')}>
                      {isActive ? 'Active' : isExpired ? 'Expired' : 'Deactivated'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(record)}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
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
