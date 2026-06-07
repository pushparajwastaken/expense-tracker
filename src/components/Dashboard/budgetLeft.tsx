"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardData } from "@/app/dashboard/page";
import API from "@/lib/axios";
import { Pencil, Wallet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  data: DashboardData | null;
  loading: boolean;
  onRefresh: () => void;
};

export const BudgetLeft = ({ data, loading, onRefresh }: Props) => {
  const [editing, setEditing] = useState(false);
  const [budgetInput, setBudgetInput] = useState("");

  const saveBudget = async () => {
    try {
      await API.post("/api/budget", { budget: Number(budgetInput) });
      toast("Budget updated");
      setEditing(false);
      onRefresh();
    } catch (error: any) {
      const message =
        error.response?.data?.error || error.message || "Something went wrong";
      toast("Failed to update budget", { description: message });
    }
  };

  const spent = data ? data.budget - data.budgetLeft : 0;
  const percentage =
    data?.budget && data.budget > 0 ? (spent / data.budget) * 100 : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Wallet className="h-4 w-4" />
          Monthly Budget
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-16 w-full" />
        ) : editing ? (
          <div className="flex gap-2 items-end">
            <div className="grid gap-1 flex-1">
              <Label>Set Budget (₹)</Label>
              <Input
                type="number"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                placeholder="e.g. 5000"
                autoFocus
              />
            </div>
            <Button onClick={saveBudget} size="sm">
              Save
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing(false)}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Spent: ₹{spent.toFixed(2)}</span>
              <span>Budget: ₹{(data?.budget ?? 0).toFixed(2)}</span>
            </div>
            <Progress value={Math.min(percentage, 100)} className="h-2" />
            <div className="flex justify-between items-center pt-1">
              <span className="text-lg font-semibold">
                ₹{(data?.budgetLeft ?? 0).toFixed(2)} left
              </span>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1.5"
                onClick={() => {
                  setBudgetInput(String(data?.budget ?? ""));
                  setEditing(true);
                }}
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit Budget
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
