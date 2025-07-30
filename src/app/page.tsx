'use client';

import { useState } from 'react';
import type { CardRecord } from '@/lib/types';
import { initialData } from '@/lib/data';
import { Header } from '@/components/header';
import { CardTable } from '@/components/card-table';
import { CardFormSheet } from '@/components/card-form-sheet';
import { DeleteAlertDialog } from '@/components/delete-alert-dialog';

export default function Home() {
  const [records, setRecords] = useState<CardRecord[]>(initialData);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CardRecord | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<CardRecord | null>(
    null
  );

  const handleAdd = () => {
    setEditingRecord(null);
    setIsSheetOpen(true);
  };

  const handleEdit = (record: CardRecord) => {
    setEditingRecord(record);
    setIsSheetOpen(true);
  };

  const handleDelete = (record: CardRecord) => {
    setDeletingRecord(record);
  };

  const handleConfirmDelete = () => {
    if (deletingRecord) {
      setRecords(records.filter((r) => r.id !== deletingRecord.id));
      setDeletingRecord(null);
    }
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

  return (
    <div className="min-h-screen w-full bg-background">
      <Header onAdd={handleAdd} />
      <main className="p-4 md:p-8">
        <CardTable
          records={records}
          onEdit={handleEdit}
        />
      </main>
      <CardFormSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        record={editingRecord}
        onSave={handleSave}
      />
      <DeleteAlertDialog
        open={!!deletingRecord}
        onOpenChange={() => setDeletingRecord(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
