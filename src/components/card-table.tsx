
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
import { Pencil, ArrowUpDown, Eye, List } from 'lucide-react';
import { Badge } from './ui/badge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

type SortableColumn = keyof Pick<CardRecord, 'staffId' | 'companyName' | 'primaryCardholderName' | 'primaryCardNumberBarcode' | 'expires' | 'active'>;

type CardTableProps = {
  records: CardRecord[];
  onViewOrEdit: (record: CardRecord) => void;
  onSort: (column: SortableColumn) => void;
  sortColumn: SortableColumn;
  sortDirection: 'asc' | 'desc';
  isReadOnly: boolean;
  onViewTransactions: (record: CardRecord) => void;
};

const StatusBadge = ({ record }: { record: CardRecord }) => {
    const [status, setStatus] = useState<{
        text: 'Active' | 'Expired' | 'Deactivated' | 'Loading...';
        variant: 'default' | 'destructive' | 'secondary';
        className: string;
    }>({ text: 'Loading...', variant: 'secondary', className: '' });

    useEffect(() => {
        const isExpired = record.expires && new Date() > record.expires;
        const isActive = record.active && !isExpired;

        if (isActive) {
            setStatus({
                text: 'Active',
                variant: 'default',
                className: 'bg-green-500 hover:bg-green-500/80',
            });
        } else if (isExpired) {
            setStatus({
                text: 'Expired',
                variant: 'destructive',
                className: '',
            });
        } else {
            setStatus({
                text: 'Deactivated',
                variant: 'secondary',
                className: 'bg-gray-500 text-gray-50 hover:bg-gray-500/80',
            });
        }
    }, [record.active, record.expires]);

    return (
        <Badge variant={status.variant} className={cn(status.className)}>
            {status.text}
        </Badge>
    );
};

export function CardTable({ records, onViewOrEdit, onSort, sortColumn, sortDirection, isReadOnly, onViewTransactions }: CardTableProps) {
    const renderSortIcon = (column: SortableColumn) => {
        if (sortColumn !== column) {
            return <ArrowUpDown className="ml-2 h-4 w-4" />;
        }
        return sortDirection === 'asc' ? (
            <ArrowUpDown className="ml-2 h-4 w-4" /> // Replace with ArrowUp icon if you have it
        ) : (
            <ArrowUpDown className="ml-2 h-4 w-4" /> // Replace with ArrowDown icon if you have it
        );
    };

  return (
    <div className="rounded-lg border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Button variant="ghost" onClick={() => onSort('staffId')}>
                Staff ID
                {renderSortIcon('staffId')}
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => onSort('companyName')}>
                Company
                {renderSortIcon('companyName')}
              </Button>
            </TableHead>
            <TableHead className="hidden md:table-cell">
              <Button variant="ghost" onClick={() => onSort('primaryCardholderName')}>
                Cardholder
                {renderSortIcon('primaryCardholderName')}
              </Button>
            </TableHead>
            <TableHead className="hidden lg:table-cell">
              <Button variant="ghost" onClick={() => onSort('primaryCardNumberBarcode')}>
                Card Number
                {renderSortIcon('primaryCardNumberBarcode')}
              </Button>
            </TableHead>
            <TableHead className="hidden sm:table-cell">
              <Button variant="ghost" onClick={() => onSort('expires')}>
                Expires
                {renderSortIcon('expires')}
              </Button>
            </TableHead>
            <TableHead className="hidden sm:table-cell">
              <Button variant="ghost" onClick={() => onSort('active')}>
                Status
                {renderSortIcon('active')}
              </Button>
            </TableHead>
             {isReadOnly && (
                <TableHead>
                    Suspected Transactions
                </TableHead>
            )}
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.length > 0 ? (
            records.map((record) => {
              return (
                <TableRow key={record.id} onClick={() => onViewOrEdit(record)} className="cursor-pointer">
                  <TableCell className="font-medium">{record.staffId}</TableCell>
                  <TableCell>{record.companyName}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {record.primaryCardholderName}
                  </TableCell>
                  <TableCell className="hidden font-mono lg:table-cell">
                    {record.primaryCardNumberBarcode}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {record.expires ? format(record.expires, 'MMM yyyy') : 'N/A'}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <StatusBadge record={record} />
                  </TableCell>
                  {isReadOnly && <TableCell>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onViewTransactions(record);
                            }}
                            >
                            <List className="mr-2 h-4 w-4" />
                            View Transactions
                        </Button>
                    </TableCell>}
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewOrEdit(record)
                      }}
                    >
                      {isReadOnly ? <Eye className="mr-2 h-4 w-4" /> : <Pencil className="mr-2 h-4 w-4" />}
                      {isReadOnly ? 'View' : 'Edit'}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={isReadOnly ? 8 : 7} className="h-24 text-center">
                No records found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

    