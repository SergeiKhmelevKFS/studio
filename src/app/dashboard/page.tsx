
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { CardRecord } from '@/lib/types';
import { initialData } from '@/lib/data';
import { Header } from '@/components/header';
import { CardTable } from '@/components/card-table';
import { CardFormSheet } from '@/components/card-form-sheet';
import { ProfileSheet } from '@/components/profile-sheet';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { DataTablePagination } from '@/components/data-table-pagination';

type SortableColumn = keyof Pick<CardRecord, 'staffId' | 'companyName' | 'primaryCardholderName' | 'primaryCardNumberBarcode' | 'expires' | 'active'>;

const getStatusSortValue = (record: CardRecord): number => {
    const isExpired = record.expires && new Date() > record.expires;
    if (isExpired) return 2; // Expired
    if (record.active) return 0; // Active
    return 1; // Deactivated
};

type User = {
    username: string;
    role: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [records, setRecords] = useState<CardRecord[]>(initialData);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isProfileSheetOpen, setIsProfileSheetOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CardRecord | null>(null);
  const [sortColumn, setSortColumn] = useState<SortableColumn>('staffId');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [user, setUser] = useState<User | null>(null);
  
  const isReadOnly = user?.role === 'Fraud Analyst';

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      router.replace('/');
      return;
    }
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
        setUser(JSON.parse(storedUser));
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
    setPage(0);
  };

  const sortedRecords = useMemo(() => {
    if (!sortColumn) return filteredRecords;
    const sorted = [...filteredRecords].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;

      let comparison = 0;
      if (sortColumn === 'active') {
        const aStatusValue = getStatusSortValue(a);
        const bStatusValue = getStatusSortValue(b);
        comparison = aStatusValue - bStatusValue;
      } else if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime();
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
    return sorted;
  }, [filteredRecords, sortColumn, sortDirection]);
  
  const paginatedRecords = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return sortedRecords.slice(start, end);
  }, [sortedRecords, page, rowsPerPage]);

  const handleAdd = () => {
    if (isReadOnly) return;
    setEditingRecord(null);
    setIsSheetOpen(true);
  };

  const handleViewOrEdit = (record: CardRecord) => {
    setEditingRecord(record);
    setIsSheetOpen(true);
  };

  const handleSave = (recordData: CardRecord) => {
    if (isReadOnly) return;
    if (editingRecord && editingRecord.id) {
        setRecords(
            records.map((r) => (r.id === editingRecord.id ? { ...recordData, id: editingRecord.id } : r))
        );
    } else {
      setRecords([...records, { ...recordData, id: Date.now().toString() }]);
    }
    setIsSheetOpen(false);
    setEditingRecord(null);
  };
  
  const handleLogout = () => {
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('user');
    router.push('/');
  };
  
  const handleProfileClick = () => {
    setIsProfileSheetOpen(true);
  };


  return (
    <div className="min-h-screen w-full bg-background">
      <Header onAdd={handleAdd} onLogout={handleLogout} onProfileClick={handleProfileClick} isReadOnly={isReadOnly} username={user?.username} />
      <main className="p-4 md:p-8">
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search by Staff ID, Cardholder or Card Number..."
            value={searchQuery}
            onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
            }}
            className="w-full max-w-sm pl-10"
          />
        </div>
        <CardTable
          records={paginatedRecords}
          onViewOrEdit={handleViewOrEdit}
          onSort={handleSort}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          isReadOnly={isReadOnly}
        />
        <DataTablePagination
            count={sortedRecords.length}
            page={page}
            onPageChange={setPage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(value) => {
                setRowsPerPage(parseInt(value, 10));
                setPage(0);
            }}
        />
      </main>
      <CardFormSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        record={editingRecord}
        onSave={handleSave}
        isReadOnly={isReadOnly}
      />
      <ProfileSheet
        open={isProfileSheetOpen}
        onOpenChange={setIsProfileSheetOpen}
       />
    </div>
  );
}
