
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
import { Search, Loader2 } from 'lucide-react';
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

type SortableColumn = keyof Pick<CardRecord, 'staffId' | 'companyName' | 'primaryCardholderName' | 'primaryCardNumberBarcode' | 'expires' | 'active'>;

const getStatusSortValue = (record: CardRecord): number => {
    const isExpired = record.expires && new Date() > record.expires;
    if (isExpired) return 2;
    if (record.active) return 0;
    return 1;
};

type User = {
    username: string;
    role: string;
};

type ReportData = {
    name: string;
    total: number;
    fill: string;
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

      if (reportType === 'card_statuses') {
        dataSet = records;
      } else {
        dataSet = records.filter(record => {
            const issueDate = record.primaryCardIssueDate;
            return issueDate >= reportStartDate! && issueDate <= reportEndDate!;
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
      } else {
        // Handle other report types here
        setReportData([]);
      }
      setIsGeneratingReport(false);
    }, 1000);
  };

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
        <div className="flex items-end">
            <Button onClick={handleGenerateReport} disabled={isGeneratingReport}>
                {isGeneratingReport && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate Report
            </Button>
        </div>
      </div>
       <div className="h-96">
        {isGeneratingReport ? (
           <div className="flex items-center justify-center h-full border rounded-lg bg-gray-50">
             <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
           </div>
        ) : reportData ? (
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
                <div className="flex items-center gap-2">
                    <Label htmlFor="chart-type-switch">Pie Chart</Label>
                    <Switch
                        id="chart-type-switch"
                        checked={chartType === 'pie'}
                        onCheckedChange={(checked) => setChartType(checked ? 'pie' : 'bar')}
                    />
                </div>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                    {chartType === 'bar' ? (
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
                                    <Cell key={entry.name} fill={entry.fill} />
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
                                    <Cell key={entry.name} fill={entry.fill} className="stroke-background" />
                                ))}
                            </Pie>
                             <ChartLegend
                                content={<ChartLegendContent nameKey="name" />}
                                className="-translate-y-[2rem] flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                              />
                        </PieChart>
                    )}
                </ChartContainer>
            </CardContent>
          </Card>
        ) : (
          <div className="flex items-center justify-center h-full border rounded-lg bg-gray-50">
              <p className="text-muted-foreground">Select report criteria and click "Generate Report".</p>
          </div>
        )}
       </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-background">
      <Header onAdd={handleAdd} onLogout={handleLogout} onProfileClick={handleProfileClick} isReadOnly={isReadOnly} username={user?.username} />
      <main className="p-4 md:p-8">
        {user?.role === 'Digital Discount Card Manager' ? (
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
    </div>
  );
}
