
'use client';

import type { UserRecord } from '@/lib/users';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, ArrowUpDown } from 'lucide-react';

type UserTableProps = {
  users: UserRecord[];
  onEdit: (user: UserRecord) => void;
  onSort: (column: keyof UserRecord) => void;
  sortColumn: keyof UserRecord;
  sortDirection: 'asc' | 'desc';
};

export function UserTable({ users, onEdit, onSort, sortColumn, sortDirection }: UserTableProps) {
    const renderSortIcon = (column: keyof UserRecord) => {
        if (sortColumn !== column) {
            return <ArrowUpDown className="ml-2 h-4 w-4" />;
        }
        return sortDirection === 'asc' ? (
            <ArrowUpDown className="ml-2 h-4 w-4" />
        ) : (
            <ArrowUpDown className="ml-2 h-4 w-4" />
        );
    };
  return (
    <div className="rounded-lg border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
                <Button variant="ghost" onClick={() => onSort('username')}>
                    Username
                    {renderSortIcon('username')}
                </Button>
            </TableHead>
            <TableHead>
                <Button variant="ghost" onClick={() => onSort('role')}>
                    Role
                    {renderSortIcon('role')}
                </Button>
            </TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length > 0 ? (
            users.map((user) => (
              <TableRow key={user.username}>
                <TableCell className="font-medium">{user.username}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(user)}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} className="h-24 text-center">
                No users found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
