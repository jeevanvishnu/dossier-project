import { Request, Response } from "express";
import { db } from "../db/db";
import { users, companies, projectDocuments } from "../db/schema";
import { sql, eq } from "drizzle-orm";

export async function getStats(req: Request, res: Response): Promise<void> {
  try {
    const [totalUsersRes] = await db.select({ count: sql<number>`count(*)::int` }).from(users);
    const [totalCompaniesRes] = await db.select({ count: sql<number>`count(*)::int` }).from(companies);
    const [activeAdminsRes] = await db.select({ count: sql<number>`count(*)::int` }).from(users).where(eq(users.role, "admin"));
    const [storageRes] = await db
      .select({ totalBytes: sql<number>`COALESCE(sum(file_size), 0)::bigint` })
      .from(projectDocuments);

    const userCount = totalUsersRes?.count || 0;
    const companyCount = totalCompaniesRes?.count || 0;
    const adminCount = activeAdminsRes?.count || 0;
    const totalBytes = Number(storageRes?.totalBytes || 0);
    const storageUsedGb = Number((totalBytes / (1024 * 1024 * 1024)).toFixed(2));

    // Monthly growth and revenue metrics (Mocked for dashboard demonstration until Stripe/billing integration)
    const monthlyFinancials = [
      { month: "Jan", revenue: 12400, mrr: 11200, expenses: 3200, netProfit: 9200, users: 10, companies: 2 },
      { month: "Feb", revenue: 18900, mrr: 15400, expenses: 4100, netProfit: 14800, users: 20, companies: 3 },
      { month: "Mar", revenue: 24500, mrr: 19800, expenses: 4800, netProfit: 19700, users: 25, companies: 5 },
      { month: "Apr", revenue: 32800, mrr: 26500, expenses: 5900, netProfit: 26900, users: 40, companies: 8 },
      { month: "May", revenue: 41200, mrr: 33900, expenses: 7200, netProfit: 34000, users: 45, companies: 9 },
      { month: "Jun", revenue: 54600, mrr: 44200, expenses: 8800, netProfit: 45800, users: 60, companies: 12 },
    ];

    // Revenue distribution by subscription tier
    const revenueByTier = [
      { name: "Enterprise", value: 34800, count: 6, color: "#6366f1" },
      { name: "Professional", value: 14200, count: 18, color: "#3b82f6" },
      { name: "Starter", value: 4600, count: 24, color: "#10b981" },
      { name: "Custom / Add-ons", value: 1000, count: 4, color: "#f59e0b" },
    ];

    // Recent financial transactions / invoices
    const recentTransactions = [
      { id: "INV-2026-0091", company: "Apex Global Pharma", plan: "Enterprise Plan", amount: 4800, date: "2026-09-18", status: "Paid" },
      { id: "INV-2026-0090", company: "BioTech Innovations", plan: "Professional Tier", amount: 1200, date: "2026-09-16", status: "Paid" },
      { id: "INV-2026-0089", company: "CureMed Labs", plan: "Enterprise Plan", amount: 5600, date: "2026-09-14", status: "Paid" },
      { id: "INV-2026-0088", company: "Novis Life Sciences", plan: "Starter Plan", amount: 450, date: "2026-09-11", status: "Paid" },
      { id: "INV-2026-0087", company: "Quantum Health Corp", plan: "Professional Tier", amount: 1200, date: "2026-09-09", status: "Processing" },
    ];

    // Aggregates
    const totalRevenue = 184400;
    const currentMRR = 44200;
    const arr = currentMRR * 12;
    const arpu = companyCount > 0 ? Math.round(totalRevenue / companyCount) : 4850;

    res.setHeader("X-Data-Mode", "mock");
    res.status(200).json({
      success: true,
      data: {
        totalUsers: userCount,
        totalCompanies: companyCount,
        activeAdmins: adminCount,
        storageUsedGb,
        isMockFinancialData: true,
        financialSummary: {
          isMockData: true,
          totalRevenue,
          currentMRR,
          arr,
          arpu,
          revenueGrowthPct: 32.5,
          mrrGrowthPct: 30.4,
          netProfitMarginPct: 83.8,
        },
        monthlyFinancials,
        revenueByTier,
        recentTransactions,
        monthlyUsers: monthlyFinancials.map(f => ({ month: f.month, users: f.users })),
        monthlyCompanies: monthlyFinancials.map(f => ({ month: f.month, count: f.companies })),
        roleDistribution: [
          { role: "User", count: Math.max(0, userCount - adminCount - 1) },
          { role: "Admin", count: adminCount },
          { role: "Super Admin", count: 1 },
        ]
      },
    });
  } catch (error: any) {
    console.error("[STATS_CONTROLLER] Error fetching stats:", error);
    res.status(500).json({ success: false, message: "Failed to fetch stats" });
  }
}
