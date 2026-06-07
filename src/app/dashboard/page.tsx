"use client";
import { useCallback, useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { AddExpense } from "@/components/Dashboard/addExepnse";
import { BudgetLeft } from "@/components/Dashboard/budgetLeft";
import { CategoricalData } from "@/components/Dashboard/categoricalComparisons";
import { Expenses } from "@/components/Dashboard/expenses";
import { WeeklyComparisons } from "@/components/Dashboard/weeklyComparisons";
import API from "@/lib/axios";
import Link from "next/link";

export type DashboardData = {
  budget: number;
  budgetLeft: number;
  weeklyComparisons: { week: string; total: string }[];
  categorySpent: { category: string; total: string }[];
  lastExpenses: {
    id: string;
    amount: string;
    category: string;
    description: string | null;
    expense_date: string;
  }[];
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get("/api/dashboard");
      if (res.data?.success === false) throw new Error(res.data.error);
      setData(res.data);
    } catch (err) {
      console.error(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div className="dashboard-container font-mono min-h-screen min-w-screen">
      <nav className="navbar-root">
        <div className="logo">TrackWise</div>
        <div className="links">
          <Link href="/expenses" className="link-items">
            Expenses
          </Link>
          <button className="btn" onClick={() => signOut({ callbackUrl: "/" })}>
            Sign Out
          </button>
        </div>
      </nav>

      <div className="dashboard-root pb-10">
        <div className="flex flex-col lg:flex-row gap-4">
          <AddExpense onRefresh={refresh} />
          <div className="flex flex-col gap-4 flex-1 min-w-0">
            <BudgetLeft data={data} loading={loading} onRefresh={refresh} />
            <Expenses data={data} loading={loading} onRefresh={refresh} />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <CategoricalData data={data} loading={loading} />
          <WeeklyComparisons data={data} loading={loading} />
        </div>
      </div>
    </div>
  );
}
