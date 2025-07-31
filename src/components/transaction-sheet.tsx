
'use client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { CardRecord, TransactionRecord } from '@/lib/types';
import { format } from 'date-fns';
import { ScrollArea } from './ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type TransactionSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactions: TransactionRecord[];
  cardRecord: CardRecord | null;
};

export function TransactionSheet({
  open,
  onOpenChange,
  transactions,
  cardRecord,
}: TransactionSheetProps) {
  const [highlightedIndices, setHighlightedIndices] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (open) {
      const indices = new Set<number>();
      if (transactions.length > 0) {
        const numToHighlight = Math.min(2, transactions.length);
        while (indices.size < numToHighlight) {
          const randomIndex = Math.floor(Math.random() * transactions.length);
          indices.add(randomIndex);
        }
      }
      setHighlightedIndices(indices);
    }
  }, [open, transactions]);


  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col sm:max-w-3xl">
        <SheetHeader>
          <SheetTitle>Card Transactions</SheetTitle>
          <SheetDescription>
            A list of recent transactions for the selected card. Potentially suspicious transactions are highlighted.
          </SheetDescription>
        </SheetHeader>
        {cardRecord && (
             <Card>
                <CardHeader>
                    <CardTitle>{cardRecord.primaryCardholderName}</CardTitle>
                    <CardDescription>{cardRecord.primaryCardNumberBarcode}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Total Transactions: {transactions.length}</p>
                </CardContent>
            </Card>
        )}
        <ScrollArea className="flex-1 rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Store</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length > 0 ? (
                transactions.map((transaction, index) => (
                  <TableRow key={transaction.id} className={cn(highlightedIndices.has(index) && 'bg-destructive/10')}>
                    <TableCell className="font-medium">
                      {format(transaction.transaction_datetime, 'PPp')}
                    </TableCell>
                    <TableCell>{transaction.transaction_store}</TableCell>
                    <TableCell>${transaction.transaction_amount.toFixed(2)}</TableCell>
                    <TableCell>{transaction.payer_name}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No transactions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

    
