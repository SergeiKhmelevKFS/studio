
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { CardRecord } from '@/lib/types';
import { initialData } from '@/lib/data';
import { Header } from '@/components/header';
import { CardTable } from '@/components/card-table';
import { CardFormSheet } from '@/components/card-form-sheet';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

type SortableColumn = keyof Pick<CardRecord, 'staffId' | 'companyName' | 'primaryCardholderName' | 'primaryCardNumberBarcode' | 'expires' | 'active'>;

export default function DashboardPage() {
  const router = useRouter();
  const [records, setRecords] = useState<CardRecord[]>(initialData);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CardRecord | null>(null);
  const [sortColumn, setSortColumn] = useState<SortableColumn>('staffId');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      router.replace('/');
    }
  }, [router]);

  const filteredRecords = useMemo(() => {
    if (!searchQuery) return records;
    const lowercasedQuery = searchQuery.toLowerCase();
    return records.filter(
      (record) =>
        record.staffId?.toLowerCase().includes(lowercasedQuery) ||
        record.primaryCardholderName?.toLowerCase().includes(lowercasedQuery) ||
        record.primaryCardNumberBarcode?.toLowerCase().includes(lowercasedQuery)
    );
  }, [records, searchQuery]);

  const handleSort = (column: SortableColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedRecords = useMemo(() => {
    if (!sortColumn) return filteredRecords;
    const sorted = [...filteredRecords].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;

      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime();
      } else if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
        comparison = aValue === bValue ? 0 : aValue ? -1 : 1;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
    return sorted;
  }, [filteredRecords, sortColumn, sortDirection]);

  const handleAdd = () => {
    setEditingRecord(null);
    setIsSheetOpen(true);
  };

  const handleEdit = (record: CardRecord) => {
    setEditingRecord(record);
    setIsSheetOpen(true);
  };

  const handleSave = (recordData: CardRecord) => {
    if (editingRecord) {
      setRecords(
        records.map((r) => (r.id === editingRecord.id ? recordData : r))
      );
    } else {
      setRecords([...records, { ...recordData, id: Date.now().toString() }]);
    }
    setIsSheetOpen(false);
    setEditingRecord(null);
  };
  
  const handleLogout = () => {
    sessionStorage.removeItem('isLoggedIn');
    router.push('/');
  };


  return (
    <div className="min-h-screen w-full bg-background">
      <Header onAdd={handleAdd} onLogout={handleLogout}/>
      <main className="p-4 md:p-8">
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search by Staff ID, Cardholder or Card Number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-sm pl-10"
          />
        </div>
        <CardTable
          records={sortedRecords}
          onEdit={handleEdit}
          onSort={handleSort}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
        />
      </main>
      <CardFormSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        record={editingRecord}
        onSave={handleSave}
      />
    </div>
  );
}
