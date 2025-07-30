
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
import { Search, Loader2, Download, UserPlus, Trash } from 'lucide-react';
import { DataTablePagination } from '@/components/data-table-pagination';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/date-picker';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from '@/components/ui/chart';
import { Switch } from '@/components/ui/switch';
import { ReportTable } from '@/components/report-table';
import { DailyReportTable } from '@/components/daily-report-table';
import type { User, UserRecord } from '@/lib/users';
import { users as defaultUsers } from '@/lib/users';
import { UserTable } from '@/components/user-table';
import { UserFormSheet } from '@/components/user-form-sheet';
import { DeleteAlertDialog } from '@/components/delete-alert-dialog';

type SortableColumn = keyof Pick<CardRecord, 'staffId' | 'companyName' | 'primaryCardholderName' | 'primaryCardNumberBarcode' | 'expires' | 'active'>;

const getStatusSortValue = (record: CardRecord): number => {
    const isExpired = record.expires && new Date() > record.expires;
    if (isExpired) return 2;
    if (record.active) return 0;
    return 1;
};

type ReportData = {
    name: string;
    total: number;
    fill?: string;
}[];

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

  const [reportType, setReportType] = useState('');
  const [reportStartDate, setReportStartDate] = useState<Date | undefined>();
  const [reportEndDate, setReportEndDate] = useState<Date | undefined>();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');
  
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [isUserSheetOpen, setIsUserSheetOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [userSortColumn, setUserSortColumn] = useState<keyof UserRecord>('username');
  const [userSortDirection, setUserSortDirection] = useState<'asc' | 'desc'>('asc');
  const [deletingUser, setDeletingUser] = useState<UserRecord | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');

  const isAdmin = user?.role === 'Administrator';
  const isReadOnly = user?.role === 'Fraud Analyst';
  const isDateRangeDisabled = reportType === 'card_statuses';

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

    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
    } else {
        const userRecords = Object.entries(defaultUsers).map(([username, data]) => ({ ...data, username }))
        setUsers(userRecords);
        localStorage.setItem('users', JSON.stringify(userRecords));
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
    const sorted = [...filteredRecords].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];
      
      const aStatusValue = getStatusSortValue(a);
      const bStatusValue = getStatusSortValue(b);

      if (sortColumn === 'active') {
        return sortDirection === 'asc' ? aStatusValue - bStatusValue : bStatusValue - aStatusValue;
      }

      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;

      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
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

  const handleAddCard = () => {
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

  const handleGenerateReport = () => {
    if (!reportType) {
      setReportData(null);
      return;
    }
    if (reportType !== 'card_statuses' && (!reportStartDate || !reportEndDate)) {
        setReportData(null);
        return;
    }
    setIsGeneratingReport(true);
    setReportData(null);

    // Simulate API call
    setTimeout(() => {
      let dataSet: CardRecord[];
      let dateField: keyof CardRecord = 'primaryCardIssueDate';

      if (reportType === 'card_statuses') {
        dataSet = records;
      } else {
        const start = reportStartDate!;
        start.setHours(0,0,0,0);
        const end = reportEndDate!;
        end.setHours(23,59,59,999);
        
        if (reportType === 'new_cards') {
            dateField = 'primaryCardIssueDate';
        } else if (reportType === 'expired_cards') {
            dateField = 'expires';
        } else if (reportType === 'deactivated_cards') {
          dateField = 'expires'; 
        }

        dataSet = records.filter(record => {
            const dateValue = record[dateField] as Date | undefined;
            
            if (reportType === 'deactivated_cards') {
              const isExpired = record.expires && new Date() > record.expires;
              const isDeactivated = !record.active && !isExpired;
              return isDeactivated && dateValue && dateValue >= start && dateValue <= end;
            }

            return dateValue && dateValue >= start && dateValue <= end;
        });
      }


      if (reportType === 'card_statuses') {
        let active = 0;
        let deactivated = 0;
        let expired = 0;

        dataSet.forEach(record => {
          const isExpired = record.expires && new Date() > record.expires;
          if (isExpired) {
            expired++;
          } else if (record.active) {
            active++;
          } else {
            deactivated++;
          }
        });
        setReportData([
          { name: 'Active', total: active, fill: 'hsl(var(--chart-green))' },
          { name: 'Deactivated', total: deactivated, fill: 'hsl(var(--chart-gray))' },
          { name: 'Expired', total: expired, fill: 'hsl(var(--chart-red))' },
        ]);
      } else if (reportType === 'new_cards' || reportType === 'expired_cards' || reportType === 'deactivated_cards') {
        const dailyCounts: { [key: string]: number } = {};
        dataSet.forEach(record => {
          const dateValue = record[dateField] as Date | undefined;
          if (dateValue) {
            const date = dateValue.toLocaleDateString();
            dailyCounts[date] = (dailyCounts[date] || 0) + 1;
          }
        });
        const chartData = Object.entries(dailyCounts)
          .map(([date, total]) => ({ name: date, total }))
          .sort((a,b) => new Date(a.name).getTime() - new Date(b.name).getTime());
        setReportData(chartData);
      } else {
        setReportData([]);
      }
      setIsGeneratingReport(false);
    }, 1000);
  };

  const handleExport = async () => {
    if (!reportData) return;
    const XLSX = await import('xlsx');
    
    let dataToExport;
    if (reportType === 'new_cards') {
        dataToExport = reportData.map(d => ({ Date: d.name, 'New Cards': d.total }));
    } else if (reportType === 'expired_cards') {
        dataToExport = reportData.map(d => ({ Date: d.name, 'Expired Cards': d.total }));
    } else if (reportType === 'deactivated_cards') {
        dataToExport = reportData.map(d => ({ Date: d.name, 'Deactivated Cards': d.total }));
    } else {
         dataToExport = reportData.map(d => ({ Status: d.name, Total: d.total }));
    }

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
    XLSX.writeFile(workbook, `${reportType}_report.xlsx`);
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setIsUserSheetOpen(true);
  };
  
  const handleEditUser = (user: UserRecord) => {
    setEditingUser(user);
    setIsUserSheetOpen(true);
  };

  const handleDeleteUserClick = (user: UserRecord) => {
    setDeletingUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDeleteUser = () => {
    if (!deletingUser) return;
    const updatedUsers = users.filter(u => u.username !== deletingUser.username);
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setIsDeleteDialogOpen(false);
    setDeletingUser(null);
  };
  
  const handleSaveUser = (userData: UserRecord) => {
    let updatedUsers;
    const existingUser = users.find(u => u.username === userData.username);
    if (existingUser) {
        updatedUsers = users.map(u => (u.username === userData.username ? userData : u));
    } else {
        updatedUsers = [...users, userData];
    }
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setIsUserSheetOpen(false);
    setEditingUser(null);
  };

  const handleUserSort = (column: keyof UserRecord) => {
    if (userSortColumn === column) {
      setUserSortDirection(userSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setUserSortColumn(column);
      setUserSortDirection('asc');
    }
  };

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      const aValue = a[userSortColumn];
      const bValue = b[userSortColumn];

      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;

      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      }

      return userSortDirection === 'asc' ? comparison : -comparison;
    });
  }, [users, userSortColumn, userSortDirection]);

  const filteredUsers = useMemo(() => {
    if (!userSearchQuery) return sortedUsers;
    const lowercasedQuery = userSearchQuery.toLowerCase();
    return sortedUsers.filter(user => user.username.toLowerCase().includes(lowercasedQuery));
  }, [sortedUsers, userSearchQuery]);

  const chartConfig = {
    total: {
      label: 'Total',
      color: 'hsl(var(--chart-green))',
    },
    Active: {
      label: 'Active',
      color: 'hsl(var(--chart-green))',
    },
    Deactivated: {
      label: 'Deactivated',
      color: 'hsl(var(--chart-gray))',
    },
    Expired: {
      label: 'Expired',
      color: 'hsl(var(--chart-red))',
    },
  } satisfies ChartConfig;

  const cardsAndUsersView = (
    <>
      <div className="mb-4 relative mt-4">
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
    </>
  );

  const reportingView = (
    <div className="pt-4">
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="grid gap-2 w-full sm:w-64">
          <Label htmlFor="report-type">Report Type</Label>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger id="report-type">
              <SelectValue placeholder="Select a report" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="card_statuses">Card Statuses</SelectItem>
              <SelectItem value="new_cards">New Cards</SelectItem>
              <SelectItem value="deactivated_cards">Deactivated Cards</SelectItem>
              <SelectItem value="expired_cards">Expired Cards</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
            <Label>Date Range</Label>
            <div className="flex items-center gap-2">
                <DatePicker value={reportStartDate} onChange={setReportStartDate} disabled={isDateRangeDisabled} />
                <span className="text-muted-foreground">to</span>
                <DatePicker value={reportEndDate} onChange={setReportEndDate} disabled={isDateRangeDisabled} />
            </div>
        </div>
        <div className="flex items-end gap-2">
            <Button onClick={handleGenerateReport} disabled={isGeneratingReport}>
                {isGeneratingReport && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate Report
            </Button>
            <Button onClick={handleExport} disabled={!reportData || reportData.length === 0} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
        </div>
      </div>
       <div className="space-y-4">
        {isGeneratingReport ? (
           <div className="flex items-center justify-center h-96 border rounded-lg bg-gray-50">
             <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
           </div>
        ) : reportData ? (
          <>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>{reportType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</CardTitle>
                    <CardDescription>
                        {reportType === 'card_statuses'
                            ? 'Current status of all cards in the system.'
                            : reportStartDate && reportEndDate &&
                              `From ${reportStartDate.toLocaleDateString()} to ${reportEndDate.toLocaleDateString()}`
                        }
                    </CardDescription>
                </div>
                {reportType === 'card_statuses' && (
                    <div className="flex items-center gap-2">
                        <Label htmlFor="chart-type-switch">Pie Chart</Label>
                        <Switch
                            id="chart-type-switch"
                            checked={chartType === 'pie'}
                            onCheckedChange={(checked) => setChartType(checked ? 'pie' : 'bar')}
                        />
                    </div>
                )}
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                    {(() => {
                        if (reportType === 'card_statuses') {
                            return chartType === 'bar' ? (
                                <BarChart accessibilityLayer data={reportData}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        tickLine={false}
                                        tickMargin={10}
                                        axisLine={false}
                                        tickFormatter={(value) => chartConfig[value as keyof typeof chartConfig]?.label}
                                    />
                                    <YAxis />
                                    <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent indicator="dot" />}
                                    />
                                    <Bar
                                        dataKey="total"
                                        radius={4}
                                    >
                                        {reportData.map((entry) => (
                                            <Cell key={`cell-${entry.name}`} fill={entry.fill!} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            ) : (
                                <PieChart accessibilityLayer>
                                    <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent hideLabel />}
                                    />
                                    <Pie
                                        data={reportData}
                                        dataKey="total"
                                        nameKey="name"
                                        innerRadius={60}
                                        strokeWidth={5}
                                    >
                                         {reportData.map((entry) => (
                                            <Cell key={`cell-${entry.name}`} fill={entry.fill!} className="stroke-background" />
                                        ))}
                                    </Pie>
                                     <ChartLegend
                                        content={<ChartLegendContent nameKey="name" />}
                                        className="-translate-y-[2rem] flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                                      />
                                </PieChart>
                            );
                        }
                        if (reportType === 'new_cards' || reportType === 'expired_cards' || reportType === 'deactivated_cards') {
                            let barColor = "hsl(var(--chart-gray))";
                            if (reportType === 'new_cards') barColor = "hsl(var(--chart-green))";
                            if (reportType === 'expired_cards') barColor = "hsl(var(--chart-red))";

                            return (
                                <BarChart accessibilityLayer data={reportData}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        tickLine={false}
                                        tickMargin={10}
                                        axisLine={false}
                                        angle={-45}
                                        textAnchor="end"
                                        minTickGap={-10}
                                        height={50}
                                    />
                                    <YAxis />
                                    <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent />}
                                    />
                                    <Bar
                                        dataKey="total"
                                        fill={barColor}
                                        radius={4}
                                    />
                                </BarChart>
                            );
                        }
                        return null;
                    })()}
                </ChartContainer>
            </CardContent>
          </Card>
          {(() => {
            if (reportType === 'card_statuses') {
              return <ReportTable data={reportData} />;
            }
            if (reportType === 'new_cards') {
              return <DailyReportTable data={reportData} title="New Cards Data" valueHeader="New Cards Issued" />;
            }
            if (reportType === 'expired_cards') {
                return <DailyReportTable data={reportData} title="Expired Cards Data" valueHeader="Expired Cards" />;
            }
             if (reportType === 'deactivated_cards') {
                return <DailyReportTable data={reportData} title="Deactivated Cards Data" valueHeader="Deactivated Cards" />;
            }
            return null;
          })()}
          </>
        ) : (
          <div className="flex items-center justify-center h-96 border rounded-lg bg-gray-50">
              <p className="text-muted-foreground">Select report criteria and click "Generate Report".</p>
          </div>
        )}
       </div>
    </div>
  );

  const adminView = (
    <div className="pt-4 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search by username..."
          value={userSearchQuery}
          onChange={(e) => setUserSearchQuery(e.target.value)}
          className="w-full max-w-sm pl-10"
        />
      </div>
      <UserTable
        users={filteredUsers}
        onEdit={handleEditUser}
        onDelete={handleDeleteUserClick}
        onSort={handleUserSort}
        sortColumn={userSortColumn}
        sortDirection={userSortDirection}
      />
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-background">
      <Header
        onAdd={isAdmin ? handleAddUser : handleAddCard}
        onLogout={handleLogout}
        onProfileClick={handleProfileClick}
        isReadOnly={isReadOnly}
        username={user?.username}
        isAdmin={isAdmin}
      />
      <main className="p-4 md:p-8">
        {isAdmin ? (
          adminView
        ) : user?.role === 'Digital Discount Card Manager' ? (
          <Tabs defaultValue="cards_users" className="w-full">
            <TabsList>
              <TabsTrigger value="cards_users">Cards & Users</TabsTrigger>
              <TabsTrigger value="reporting">Reporting</TabsTrigger>
            </TabsList>
            <TabsContent value="cards_users">
              {cardsAndUsersView}
            </TabsContent>
            <TabsContent value="reporting">
              {reportingView}
            </TabsContent>
          </Tabs>
        ) : (
          cardsAndUsersView
        )}
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
       <UserFormSheet
        open={isUserSheetOpen}
        onOpenChange={setIsUserSheetOpen}
        user={editingUser}
        onSave={handleSaveUser}
       />
       <DeleteAlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDeleteUser}
        title={`Delete user ${deletingUser?.username}?`}
        description="This action cannot be undone. This will permanently delete the user and all associated data."
       />
    </div>
  );
}
