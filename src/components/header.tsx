
'use client';

import { Button } from '@/components/ui/button';
import { LogOut, PlusCircle, User } from 'lucide-react';

type HeaderProps = {
  onAdd: () => void;
  onLogout: () => void;
  onProfileClick: () => void;
  isReadOnly: boolean;
  username?: string;
};

const Logo = () => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    className="rounded-md"
  >
    <rect width="100" height="100" fill="#f46f02" />
    <text
      x="50"
      y="78"
      fontFamily="Arial, sans-serif"
      fontSize="50"
      fontWeight="bold"
      fill="white"
      textAnchor="middle"
    >
      B&Q
    </text>
  </svg>
);

export function Header({ onAdd, onLogout, onProfileClick, isReadOnly, username }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:px-8">
      <div className="flex items-center gap-3">
        <Logo />
        <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
          B&Q Discount Card Management System
        </h1>
      </div>
      <div className="flex items-center gap-2">
        {!isReadOnly && (
            <Button onClick={onAdd} className="gap-2">
            <PlusCircle className="h-5 w-5" />
            <span className="hidden sm:inline">New Card</span>
            </Button>
        )}
        <Button onClick={onProfileClick} variant="outline" className="gap-2">
            <User className="h-5 w-5" />
            {username && <span className="hidden sm:inline">{username}</span>}
            <span className="sr-only">Profile</span>
        </Button>
        <Button onClick={onLogout} variant="outline" className="gap-2">
         <LogOut className="h-5 w-5" />
         <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}
