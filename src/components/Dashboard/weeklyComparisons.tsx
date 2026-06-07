"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardData } from "@/app/dashboard/page";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Props = {
  data: DashboardData | null;
  loading: boolean;
};

export const WeeklyComparisons = ({ data, loading }: Props) => {
  const chartData =
    data?.weeklyComparisons?.map((w) => ({
      week: new Date(w.week).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      }),
      total: Number(w.total),
    })) ?? [];

  return (
    <Card className="flex-1 min-w-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Weekly Spending</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-48 w-full" />
        ) : chartData.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-14">
            No data yet
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ left: -10 }}>
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value) =>
                  typeof value === "number"
                    ? [`₹${value.toFixed(2)}`, "Total"]
                    : [value, "Total"]
                }
              />
              <Bar
                dataKey="total"
                fill="oklch(0.556 0 0)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
