'use client';

import { Button } from '@/components/ui/button';
import { CreditCard, PlusCircle } from 'lucide-react';

type HeaderProps = {
  onAdd: () => void;
};

export function Header({ onAdd }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:px-8">
      <div className="flex items-center gap-2">
        <CreditCard className="h-7 w-7 text-primary" />
        <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
          B&Q Discount Card
        </h1>
      </div>
      <Button onClick={onAdd} className="gap-2">
        <PlusCircle className="h-5 w-5" />
        <span className="hidden sm:inline">Add Record</span>
      </Button>
    </header>
  );
}
