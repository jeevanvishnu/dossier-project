"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from "recharts";
import {
  CurrencyDollar,
  TrendUp,
  CreditCard,
  Receipt,
  ArrowUpRight,
  Sparkle,
  CheckCircle,
  Clock
} from "@phosphor-icons/react";

interface MonthlyFinancial {
  month: string;
  revenue: number;
  mrr: number;
  expenses: number;
  netProfit: number;
  users: number;
  companies: number;
}

interface RevenueTier {
  name: string;
  value: number;
  count: number;
  color: string;
}

interface Transaction {
  id: string;
  company: string;
  plan: string;
  amount: number;
  date: string;
  status: string;
}

interface FinancialSummary {
  totalRevenue: number;
  currentMRR: number;
  arr: number;
  arpu: number;
  revenueGrowthPct: number;
  mrrGrowthPct: number;
  netProfitMarginPct: number;
}

interface SuperAdminChartsProps {
  financialSummary?: FinancialSummary;
  monthlyFinancials?: MonthlyFinancial[];
  revenueByTier?: RevenueTier[];
  recentTransactions?: Transaction[];
}

// Currency formatter
const formatCurrency = (val: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(val);
};

// Custom Glassmorphism Tooltip for Recharts
const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface/95 backdrop-blur-md border border-border p-3.5 rounded-xl shadow-xl min-w-[170px] text-xs transition-all">
        <p className="font-lexend font-bold text-primary mb-2 text-sm border-b border-border/60 pb-1">
          {label}
        </p>
        <div className="space-y-1.5">
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-secondary">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block shrink-0 shadow-xs"
                  style={{ backgroundColor: entry.color || entry.stroke || entry.fill }}
                />
                {entry.name}:
              </span>
              <span className="font-semibold text-primary">
                {typeof entry.value === "number" && entry.name.toLowerCase().includes("user")
                  ? entry.value
                  : formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// Custom Pie Chart Tooltip
const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-surface/95 backdrop-blur-md border border-border p-3 rounded-xl shadow-xl text-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.payload.color }} />
          <span className="font-semibold text-primary">{data.name}</span>
        </div>
        <p className="text-secondary">
          Revenue: <span className="font-bold text-primary">{formatCurrency(data.value)}</span>
        </p>
        {data.payload.count && (
          <p className="text-muted mt-0.5">{data.payload.count} active accounts</p>
        )}
      </div>
    );
  }
  return null;
};

export function SuperAdminCharts({
  financialSummary,
  monthlyFinancials = [],
  revenueByTier = [],
  recentTransactions = []
}: SuperAdminChartsProps) {
  const [activeMetric, setActiveMetric] = useState<"all" | "revenue" | "profit">("all");

  const summary = financialSummary || {
    totalRevenue: 184400,
    currentMRR: 44200,
    arr: 530400,
    arpu: 4850,
    revenueGrowthPct: 32.5,
    mrrGrowthPct: 30.4,
    netProfitMarginPct: 83.8,
  };

  const defaultFinancials: MonthlyFinancial[] = [
    { month: "Jan", revenue: 12400, mrr: 11200, expenses: 3200, netProfit: 9200, users: 10, companies: 2 },
    { month: "Feb", revenue: 18900, mrr: 15400, expenses: 4100, netProfit: 14800, users: 20, companies: 3 },
    { month: "Mar", revenue: 24500, mrr: 19800, expenses: 4800, netProfit: 19700, users: 25, companies: 5 },
    { month: "Apr", revenue: 32800, mrr: 26500, expenses: 5900, netProfit: 26900, users: 40, companies: 8 },
    { month: "May", revenue: 41200, mrr: 33900, expenses: 7200, netProfit: 34000, users: 45, companies: 9 },
    { month: "Jun", revenue: 54600, mrr: 44200, expenses: 8800, netProfit: 45800, users: 60, companies: 12 },
  ];

  const dataList = monthlyFinancials.length > 0 ? monthlyFinancials : defaultFinancials;

  const defaultTiers: RevenueTier[] = [
    { name: "Enterprise", value: 34800, count: 6, color: "#6366f1" },
    { name: "Professional", value: 14200, count: 18, color: "#3b82f6" },
    { name: "Starter", value: 4600, count: 24, color: "#10b981" },
    { name: "Custom / Add-ons", value: 1000, count: 4, color: "#f59e0b" },
  ];

  const tierList = revenueByTier.length > 0 ? revenueByTier : defaultTiers;

  const defaultTransactions: Transaction[] = [
    { id: "INV-2026-0091", company: "Apex Global Pharma", plan: "Enterprise Plan", amount: 4800, date: "2026-09-18", status: "Paid" },
    { id: "INV-2026-0090", company: "BioTech Innovations", plan: "Professional Tier", amount: 1200, date: "2026-09-16", status: "Paid" },
    { id: "INV-2026-0089", company: "CureMed Labs", plan: "Enterprise Plan", amount: 5600, date: "2026-09-14", status: "Paid" },
    { id: "INV-2026-0088", company: "Novis Life Sciences", plan: "Starter Plan", amount: 450, date: "2026-09-11", status: "Paid" },
    { id: "INV-2026-0087", company: "Quantum Health Corp", plan: "Professional Tier", amount: 1200, date: "2026-09-09", status: "Processing" },
  ];

  const transactionsList = recentTransactions.length > 0 ? recentTransactions : defaultTransactions;

  return (
    <div className="space-y-6">
      {/* Financial Executive Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Gross Revenue */}
        <div className="bg-surface border border-border p-5 rounded-2xl shadow-sm relative overflow-hidden group hover:border-accent/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">Gross Revenue</span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              <TrendUp size={14} weight="bold" />
              +{summary.revenueGrowthPct}%
            </span>
          </div>
          <p className="text-3xl font-extrabold font-lexend text-primary tracking-tight">
            {formatCurrency(summary.totalRevenue)}
          </p>
          <p className="text-xs text-secondary mt-1 flex items-center gap-1">
            <Sparkle size={13} className="text-amber-400" weight="fill" />
            Total earnings to date
          </p>
          <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-2xl pointer-events-none group-hover:bg-accent/10 transition-all" />
        </div>

        {/* Monthly Recurring Revenue */}
        <div className="bg-surface border border-border p-5 rounded-2xl shadow-sm relative overflow-hidden group hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">Current MRR</span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full">
              <TrendUp size={14} weight="bold" />
              +{summary.mrrGrowthPct}% MoM
            </span>
          </div>
          <p className="text-3xl font-extrabold font-lexend text-primary tracking-tight">
            {formatCurrency(summary.currentMRR)}
          </p>
          <p className="text-xs text-secondary mt-1">
            Monthly recurring subscription stream
          </p>
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/10 transition-all" />
        </div>

        {/* Annual Run Rate (ARR) */}
        <div className="bg-surface border border-border p-5 rounded-2xl shadow-sm relative overflow-hidden group hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">Annual Run Rate (ARR)</span>
            <span className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <CurrencyDollar size={16} weight="bold" />
            </span>
          </div>
          <p className="text-3xl font-extrabold font-lexend text-primary tracking-tight">
            {formatCurrency(summary.arr)}
          </p>
          <p className="text-xs text-secondary mt-1">
            Projected 12-month contracted value
          </p>
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/10 transition-all" />
        </div>

        {/* ARPU / Net Margin */}
        <div className="bg-surface border border-border p-5 rounded-2xl shadow-sm relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">Avg Rev / Company</span>
            <span className="inline-flex items-center text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              {summary.netProfitMarginPct}% Margin
            </span>
          </div>
          <p className="text-3xl font-extrabold font-lexend text-primary tracking-tight">
            {formatCurrency(summary.arpu)}
          </p>
          <p className="text-xs text-secondary mt-1">
            High unit economics & healthy margins
          </p>
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/10 transition-all" />
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue & Growth Trajectory Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-surface border border-border p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-lexend font-bold text-lg text-primary">Revenue & Cash Flow Dynamics</h3>
                <span className="bg-accent/10 text-accent text-[11px] font-semibold px-2 py-0.5 rounded-md border border-accent/20">
                  Live Analytics
                </span>
              </div>
              <p className="text-xs text-secondary mt-0.5">
                Detailed monthly revenue, MRR subscriptions, and operating costs
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center bg-surface-raised border border-border rounded-xl p-1 gap-1 self-start sm:self-auto">
              <button
                onClick={() => setActiveMetric("all")}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                  activeMetric === "all"
                    ? "bg-accent text-white shadow-xs"
                    : "text-secondary hover:text-primary"
                }`}
              >
                All Metrics
              </button>
              <button
                onClick={() => setActiveMetric("revenue")}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                  activeMetric === "revenue"
                    ? "bg-accent text-white shadow-xs"
                    : "text-secondary hover:text-primary"
                }`}
              >
                Revenue
              </button>
              <button
                onClick={() => setActiveMetric("profit")}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                  activeMetric === "profit"
                    ? "bg-accent text-white shadow-xs"
                    : "text-secondary hover:text-primary"
                }`}
              >
                Net Profit
              </button>
            </div>
          </div>

          {/* Recharts Area Chart */}
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataList} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284C7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0284C7" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorMRR" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.6} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={{ stroke: "var(--color-border)" }}
                  tick={{ fill: "var(--color-muted)", fontSize: 12, fontFamily: "var(--font-lexend)" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                  tick={{ fill: "var(--color-muted)", fontSize: 11 }}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: 15, fontSize: 12 }}
                />

                {(activeMetric === "all" || activeMetric === "revenue") && (
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Gross Revenue"
                    stroke="#0284C7"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
                  />
                )}

                {activeMetric === "all" && (
                  <Area
                    type="monotone"
                    dataKey="mrr"
                    name="MRR"
                    stroke="#6366F1"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorMRR)"
                    activeDot={{ r: 5 }}
                  />
                )}

                {(activeMetric === "all" || activeMetric === "profit") && (
                  <Area
                    type="monotone"
                    dataKey="netProfit"
                    name="Net Profit"
                    stroke="#10B981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorProfit)"
                    activeDot={{ r: 5 }}
                  />
                )}

                {activeMetric === "all" && (
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    name="Operating Expenses"
                    stroke="#EF4444"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    fillOpacity={1}
                    fill="url(#colorExpenses)"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Breakdown by Tier (Donut Chart - 1 Col) */}
        <div className="bg-surface border border-border p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-lexend font-bold text-lg text-primary">Revenue by Tier</h3>
              <CreditCard size={20} className="text-secondary" />
            </div>
            <p className="text-xs text-secondary mb-4">
              Subscription share across active plans
            </p>
          </div>

          <div className="h-[230px] w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tierList}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {tierList.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="var(--color-surface)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label inside donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[11px] font-semibold text-muted uppercase">Total Tier</span>
              <span className="text-lg font-bold font-lexend text-primary">
                {formatCurrency(tierList.reduce((acc, curr) => acc + curr.value, 0))}
              </span>
            </div>
          </div>

          {/* Tier Legend & Share list */}
          <div className="space-y-2 mt-2 pt-3 border-t border-border/70">
            {tierList.map((tier) => (
              <div key={tier.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tier.color }} />
                  <span className="text-secondary font-medium">{tier.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-primary">{formatCurrency(tier.value)}</span>
                  <span className="text-muted text-[11px]">({tier.count})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second Row: Bar Chart Comparison & Recent Billing Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue vs Cost Bar Chart (1 Col) */}
        <div className="bg-surface border border-border p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-lexend font-bold text-lg text-primary">Revenue vs Cost Breakdown</h3>
            <p className="text-xs text-secondary mt-0.5 mb-4">
              Monthly comparison of gross intake against infrastructure expense
            </p>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataList} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.6} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={{ stroke: "var(--color-border)" }}
                  tick={{ fill: "var(--color-muted)", fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                  tick={{ fill: "var(--color-muted)", fontSize: 10 }}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <Bar dataKey="revenue" name="Revenue" fill="#0284C7" radius={[5, 5, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#F43F5E" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Invoices & Billing Ledger (2 Cols) */}
        <div className="lg:col-span-2 bg-surface border border-border p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Receipt size={20} className="text-accent" />
                <h3 className="font-lexend font-bold text-lg text-primary">Recent Invoices & Cash Inflow</h3>
              </div>
              <p className="text-xs text-secondary mt-0.5">
                Latest customer subscription charges and settlement statuses
              </p>
            </div>
            <span className="text-xs text-accent font-medium hover:underline flex items-center gap-1 cursor-pointer">
              View All <ArrowUpRight size={13} />
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted uppercase bg-surface-raised/60 border-b border-border">
                <tr>
                  <th className="px-4 py-2.5 rounded-l-lg">Invoice</th>
                  <th className="px-4 py-2.5">Company</th>
                  <th className="px-4 py-2.5">Plan</th>
                  <th className="px-4 py-2.5">Amount</th>
                  <th className="px-4 py-2.5">Date</th>
                  <th className="px-4 py-2.5 rounded-r-lg text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {transactionsList.map((tx) => (
                  <tr key={tx.id} className="hover:bg-surface-raised/40 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-secondary">{tx.id}</td>
                    <td className="px-4 py-3 font-medium text-primary">{tx.company}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-md bg-accent/10 text-accent font-medium">
                        {tx.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-primary">{formatCurrency(tx.amount)}</td>
                    <td className="px-4 py-3 text-xs text-muted">{tx.date}</td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                          tx.status === "Paid"
                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                        }`}
                      >
                        {tx.status === "Paid" ? (
                          <CheckCircle size={12} weight="fill" />
                        ) : (
                          <Clock size={12} weight="fill" />
                        )}
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
