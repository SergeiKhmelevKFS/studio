
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { CardRecord, TransactionRecord } from '@/lib/types';
import { initialData, initialTransactions } from '@/lib/data';
import { Header } from '@/components/header';
import { CardTable } from '@/components/card-table';
import { CardFormSheet } from '@/components/card-form-sheet';
import { ProfileSheet } from '@/components/profile-sheet';
import { Input } from '@/components/ui/input';
import { Search, Loader2, Download, UserPlus, Trash, List, AlertTriangle, FilePenLine, XCircle } from 'lucide-react';
import { DataTablePagination } from '@/components/data-table-pagination';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/date-picker';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell } from 'recharts';
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
import { TransactionSheet } from '@/components/transaction-sheet';
import { MisuseReportTable, type MisuseReportRecord } from '@/components/misuse-report-table';
import { EditMisuseRulesSheet, type MisuseRule } from '@/components/edit-misuse-rules-sheet';
import { format, subDays } from 'date-fns';

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

type ReportSortColumn = 'name' | 'total';

const misuseHistoryData = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), i * 5);
    return {
      date: format(date, 'MMM d'),
      detected: Math.floor(Math.random() * (20 - 5 + 1)) + 5,
    };
  }).reverse();

const misuseChartConfig = {
    detected: {
      label: 'Detected Misuse',
      color: 'hsl(var(--primary))',
    },
} satisfies ChartConfig;

const defaultRules: MisuseRule[] = [
    { id: '1', field: 'payer_mismatch', operator: '>', value: '50' },
    { id: '2', field: 'transaction_count', operator: '>', value: '3' },
    { id: '3', field: 'transaction_amount', operator: '>', value: '150' },
    { id: '4', field: 'stores_distance', operator: '>', value: '100' },
];


export default function DashboardPage() {
  const router = useRouter();
  const [records, setRecords] = useState<CardRecord[]>(initialData);
  const [transactions, setTransactions] = useState<TransactionRecord[]>(initialTransactions);
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
  const [reportSortColumn, setReportSortColumn] = useState<ReportSortColumn>('name');
  const [reportSortDirection, setReportSortDirection] = useState<'asc' | 'desc'>('asc');
  
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [isUserSheetOpen, setIsUserSheetOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [userSortColumn, setUserSortColumn] = useState<keyof UserRecord>('username');
  const [userSortDirection, setUserSortDirection] = useState<'asc' | 'desc'>('asc');
  const [deletingUser, setDeletingUser] = useState<UserRecord | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');

  const [isTransactionSheetOpen, setIsTransactionSheetOpen] = useState(false);
  const [selectedCardTransactions, setSelectedCardTransactions] = useState<TransactionRecord[]>([]);
  const [selectedCardForTransactions, setSelectedCardForTransactions] = useState<CardRecord | null>(null);

  const [isSearchingMisuse, setIsSearchingMisuse] = useState(false);
  const [misuseReport, setMisuseReport] = useState<MisuseReportRecord[] | null>(null);
  const [hasSearchedMisuse, setHasSearchedMisuse] = useState(false);
  
  const [isEditRulesSheetOpen, setIsEditRulesSheetOpen] = useState(false);
  const [misuseRules, setMisuseRules] = useState<MisuseRule[]>(defaultRules);

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
    
    const storedRules = localStorage.getItem('misuseRules');
    if (storedRules) {
        try {
            const parsedRules = JSON.parse(storedRules);
            if (Array.isArray(parsedRules) && parsedRules.length > 0) {
                setMisuseRules(parsedRules);
            } else {
              localStorage.setItem('misuseRules', JSON.stringify(defaultRules));
            }
        } catch (e) {
            localStorage.setItem('misuseRules', JSON.stringify(defaultRules));
        }
    } else {
        localStorage.setItem('misuseRules', JSON.stringify(defaultRules));
    }
  }, [router]);

  const displayedRecords = useMemo(() => {
    return records;
  }, [records]);
  
  const filteredRecords = useMemo(() => {
    if (!searchQuery) return displayedRecords;
    const lowercasedQuery = searchQuery.toLowerCase();
    return displayedRecords.filter(
      (record) =>
        record.staffId?.toLowerCase().includes(lowercasedQuery) ||
        record.primaryCardholderName?.toLowerCase().includes(lowercasedQuery) ||
        record.primaryCardNumberBarcode?.toLowerCase().includes(lowercasedQuery)
    );
  }, [displayedRecords, searchQuery]);

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

  const handleReportTypeChange = (value: string) => {
    setReportType(value);
    setReportData(null);
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
        dataToExport = sortedReportData.map(d => ({ Date: d.name, 'New Cards': d.total }));
    } else if (reportType === 'expired_cards') {
        dataToExport = sortedReportData.map(d => ({ Date: d.name, 'Expired Cards': d.total }));
    } else if (reportType === 'deactivated_cards') {
        dataToExport = sortedReportData.map(d => ({ Date: d.name, 'Deactivated Cards': d.total }));
    } else {
         dataToExport = sortedReportData.map(d => ({ Status: d.name, Total: d.total }));
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

  const handleReportSort = (column: ReportSortColumn) => {
    if (reportSortColumn === column) {
      setReportSortDirection(reportSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setReportSortColumn(column);
      setReportSortDirection('asc');
    }
  };

  const sortedReportData = useMemo(() => {
    if (!reportData) return [];
    return [...reportData].sort((a, b) => {
      const aValue = a[reportSortColumn];
      const bValue = b[reportSortColumn];

      let comparison = 0;
      if (reportSortColumn === 'name') {
        if (reportType === 'card_statuses') {
          comparison = (aValue as string).localeCompare(bValue as string);
        } else {
          comparison = new Date(aValue as string).getTime() - new Date(bValue as string).getTime();
        }
      } else { // total
        comparison = (aValue as number) - (bValue as number);
      }

      return reportSortDirection === 'asc' ? comparison : -comparison;
    });
  }, [reportData, reportSortColumn, reportSortDirection, reportType]);
  
  const handleViewTransactions = (record: CardRecord) => {
    const cardTransactions = transactions.filter(t => t.cardRecordId === record.id);
    setSelectedCardForTransactions(record);
    setSelectedCardTransactions(cardTransactions);
    setIsTransactionSheetOpen(true);
  };

  const handleSearchMisuse = () => {
    setIsSearchingMisuse(true);
    setMisuseReport(null);

    setTimeout(() => {
        const flaggedCards = [
            records.find(c => c.id === 'misuse-payer'),
            records.find(c => c.id === 'misuse-frequency'),
            records.find(c => c.id === 'misuse-geo'),
        ].filter(Boolean) as CardRecord[];

        const reasons = ['Payer mismatch', 'transactions count', 'transactions amount'];
        let reasonIndex = 0;

        const report = flaggedCards.map(card => {
            const reasonIndex = Math.floor(Math.random() * reasons.length);
            const reason = reasons[reasonIndex];
            return {
                ...card,
                reasons: [reason],
            };
        });
        
        setMisuseReport(report);
        setHasSearchedMisuse(true);
        setIsSearchingMisuse(false);
    }, 5000);
  };
  
  const handleClearMisuseSearch = () => {
    setHasSearchedMisuse(false);
    setMisuseReport(null);
  };

  const handleSaveRules = (newRules: MisuseRule[]) => {
    setMisuseRules(newRules);
    localStorage.setItem('misuseRules', JSON.stringify(newRules));
    setIsEditRulesSheetOpen(false);
  };

  const cardsAndUsersView = (
    <>
      {isReadOnly && (
         <Card className="mb-8">
            <CardHeader>
                <CardTitle>Misuse Detection Trends</CardTitle>
                <CardDescription>Detected potential misuse cases over the last 30 days.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={misuseChartConfig} className="h-64 w-full">
                    <AreaChart
                        data={misuseHistoryData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorDetected" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-detected)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--color-detected)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                        />
                        <YAxis />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        <Area
                            dataKey="detected"
                            type="monotone"
                            fill="url(#colorDetected)"
                            stroke="var(--color-detected)"
                            stackId="a"
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
         </Card>
      )}

      <div className="flex items-center justify-end mt-4 mb-4 space-x-2">
        {isReadOnly && (
          <>
            <Button onClick={() => setIsEditRulesSheetOpen(true)} variant="outline">
              <FilePenLine className="mr-2 h-4 w-4" />
              Edit Misuse Rules
            </Button>
            <Button onClick={handleSearchMisuse} disabled={isSearchingMisuse}>
              {isSearchingMisuse ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <AlertTriangle className="mr-2 h-4 w-4" />
              )}
              Search for Misuse
            </Button>
            {hasSearchedMisuse && (
                 <Button onClick={handleClearMisuseSearch} variant="destructive">
                    <XCircle className="mr-2 h-4 w-4" />
                    Clear Results
                </Button>
            )}
          </>
        )}
      </div>

      {isSearchingMisuse ? (
        <div className="flex items-center justify-center h-96 border rounded-lg bg-gray-50">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="ml-4 text-muted-foreground">Analyzing transactions for potential misuse...</p>
        </div>
      ) : hasSearchedMisuse && isReadOnly ? (
        <>
            {misuseReport && misuseReport.length > 0 ? (
                <div className="mb-8">
                     <MisuseReportTable
                        records={misuseReport}
                        onViewTransactions={handleViewTransactions}
                        onViewRecord={handleViewOrEdit}
                     />
                </div>
            ) : (
                <div className="flex items-center justify-center h-48 border rounded-lg bg-gray-50 mb-8">
                    <p className="text-muted-foreground">No potential card misuse detected.</p>
                </div>
            )}
        </>
      ) : (
        <>
          {!isReadOnly && (
            <>
              <div className="flex items-center justify-between mt-4 mb-4">
                  <div className="relative">
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
              </div>
              <CardTable
                  records={paginatedRecords}
                  onViewOrEdit={handleViewOrEdit}
                  onSort={handleSort}
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                  isReadOnly={!!isReadOnly}
                  onViewTransactions={handleViewTransactions}
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
          )}
        </>
      )}
    </>
  );

  const reportingView = (
    <div className="pt-4">
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="grid gap-2 w-full sm:w-64">
          <Label htmlFor="report-type">Report Type</Label>
          <Select value={reportType} onValueChange={handleReportTypeChange}>
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
                <ChartContainer config={chartConfig} className="w-4/5 mx-auto">
                    {(() => {
                        if (reportType === 'card_statuses') {
                            return chartType === 'bar' ? (
                                <BarChart accessibilityLayer data={reportData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                     <defs>
                                        <linearGradient id="gradient-Active" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--color-Active)" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="var(--color-Active)" stopOpacity={0.2}/>
                                        </linearGradient>
                                        <linearGradient id="gradient-Deactivated" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--color-Deactivated)" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="var(--color-Deactivated)" stopOpacity={0.2}/>
                                        </linearGradient>
                                        <linearGradient id="gradient-Expired" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--color-Expired)" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="var(--color-Expired)" stopOpacity={0.2}/>
                                        </linearGradient>
                                    </defs>
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
                                        radius={8}
                                    >
                                      {reportData.map((entry) => (
                                        <Cell key={`cell-${entry.name}`} fill={entry.fill || `url(#gradient-${entry.name})`} />
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
                                            <Cell key={`cell-${entry.name}`} fill={entry.fill} className="stroke-background" />
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
                            let gradientId = "gradient-gray";
                            if (reportType === 'new_cards') gradientId = "gradient-green";
                            if (reportType === 'expired_cards') gradientId = "gradient-red";
                            if (reportType === 'deactivated_cards') gradientId = "gradient-gray";


                            return (
                                <BarChart accessibilityLayer data={reportData} margin={{ top: 20, right: 20, bottom: 70, left: 20 }}>
                                    <defs>
                                        <linearGradient id="gradient-green" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--chart-green))" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="hsl(var(--chart-green))" stopOpacity={0.2}/>
                                        </linearGradient>
                                         <linearGradient id="gradient-red" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--chart-red))" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="hsl(var(--chart-red))" stopOpacity={0.2}/>
                                        </linearGradient>
                                         <linearGradient id="gradient-gray" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--chart-gray))" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="hsl(var(--chart-gray))" stopOpacity={0.2}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        tickLine={false}
                                        tickMargin={10}
                                        axisLine={false}
                                        angle={-45}
                                        textAnchor="end"
                                        height={70}
                                        interval={Math.floor((reportData?.length || 0) / 7)}
                                    />
                                    <YAxis />
                                    <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent />}
                                    />
                                    <Bar
                                        dataKey="total"
                                        fill={`url(#${gradientId})`}
                                        radius={8}
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
              return <ReportTable data={sortedReportData} onSort={handleReportSort} sortColumn={reportSortColumn} sortDirection={reportSortDirection} />;
            }
            if (reportType === 'new_cards') {
              return <DailyReportTable data={sortedReportData} title="New Cards Data" valueHeader="New Cards Issued" onSort={handleReportSort} sortColumn={reportSortColumn} sortDirection={reportSortDirection} />;
            }
            if (reportType === 'expired_cards') {
                return <DailyReportTable data={sortedReportData} title="Expired Cards Data" valueHeader="Expired Cards" onSort={handleReportSort} sortColumn={reportSortColumn} sortDirection={reportSortDirection} />;
            }
             if (reportType === 'deactivated_cards') {
                return <DailyReportTable data={sortedReportData} title="Deactivated Cards Data" valueHeader="Deactivated Cards" onSort={handleReportSort} sortColumn={reportSortColumn} sortDirection={reportSortDirection} />;
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
      <div className="flex justify-between items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search by username..."
            value={userSearchQuery}
            onChange={(e) => setUserSearchQuery(e.target.value)}
            className="w-full max-w-sm pl-10"
          />
        </div>
        <Button onClick={handleAddUser} className="gap-2">
            <UserPlus className="h-5 w-5" />
            <span className="hidden sm:inline">New User</span>
        </Button>
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
        onAdd={handleAddCard}
        onLogout={handleLogout}
        onProfileClick={handleProfileClick}
        isReadOnly={!!isReadOnly}
        isAdmin={!!isAdmin}
        username={user?.username}
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
        isReadOnly={!!isReadOnly}
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
       <TransactionSheet
        open={isTransactionSheetOpen}
        onOpenChange={setIsTransactionSheetOpen}
        transactions={selectedCardTransactions}
        cardRecord={selectedCardForTransactions}
        />
        <EditMisuseRulesSheet
          open={isEditRulesSheetOpen}
          onOpenChange={setIsEditRulesSheetOpen}
          rules={misuseRules}
          onSave={handleSaveRules}
        />
    </div>
  );
}

