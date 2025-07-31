
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
import { List, AlertTriangle, Eye } from 'lucide-react';
import { Badge } from './ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';

export type MisuseReportRecord = CardRecord & {
  reasons: string[];
};

type MisuseReportTableProps = {
  records: MisuseReportRecord[];
  onViewTransactions: (record: CardRecord) => void;
  onViewRecord: (record: CardRecord) => void;
};

export function MisuseReportTable({ records, onViewTransactions, onViewRecord }: MisuseReportTableProps) {
  return (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-destructive" />
                Potential Card Misuse Report
            </CardTitle>
            <CardDescription>
                The following cards have been flagged for potential misuse based on transaction analysis. Review each case carefully.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="rounded-lg border bg-card shadow-sm">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Staff ID</TableHead>
                        <TableHead>Cardholder</TableHead>
                        <TableHead>Card Number</TableHead>
                        <TableHead>Reasons for Flagging</TableHead>
                        <TableHead>
                        <span className="sr-only">Actions</span>
                        </TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {records.length > 0 ? (
                        records.map((record) => {
                        return (
                            <TableRow key={record.id} className="hover:bg-destructive/10">
                            <TableCell className="font-medium">{record.staffId}</TableCell>
                            <TableCell>{record.primaryCardholderName}</TableCell>
                            <TableCell className="font-mono">{record.primaryCardNumberBarcode}</TableCell>
                            <TableCell>
                                <ul className="list-disc pl-5 space-y-1">
                                    {record.reasons.map((reason, index) => (
                                       <li key={index} className="text-sm">{reason}</li>
                                    ))}
                                </ul>
                            </TableCell>
                            <TableCell className="space-x-2">
                                <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onViewTransactions(record);
                                }}
                                >
                                <List className="mr-2 h-4 w-4" />
                                Transactions
                                </Button>
                                <Button
                                variant="secondary"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onViewRecord(record);
                                }}
                                >
                                <Eye className="mr-2 h-4 w-4" />
                                View Card
                                </Button>
                            </TableCell>
                            </TableRow>
                        );
                        })
                    ) : (
                        <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                            No potential misuse detected.
                        </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
    </Card>

  );
}
