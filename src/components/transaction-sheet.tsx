
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
import type { TransactionRecord } from '@/lib/types';
import { format } from 'date-fns';
import { ScrollArea } from './ui/scroll-area';

type TransactionSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactions: TransactionRecord[];
};

export function TransactionSheet({
  open,
  onOpenChange,
  transactions,
}: TransactionSheetProps) {

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col sm:max-w-3xl">
        <SheetHeader>
          <SheetTitle>Card Transactions</SheetTitle>
          <SheetDescription>
            A list of recent transactions for the selected card.
          </SheetDescription>
        </SheetHeader>
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
                transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
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

    