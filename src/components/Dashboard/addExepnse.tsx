"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import API from "@/lib/axios";
import { Plus, PlusCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const AddExpense = ({ onRefresh }: { onRefresh: () => void }) => {
  const [expense, setExpense] = useState({
    amount: "",
    category: "",
    description: "",
    expenseDate: new Date().toISOString().split("T")[0],
  });

  const onAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await API.post("/api/expenses", {
        amount: Number(expense.amount),
        category: expense.category,
        description: expense.description,
        expenseDate: expense.expenseDate,
      });
      toast("Expense Added", {
        description: `₹${expense.amount} added to ${expense.category}`,
      });
      setExpense({
        amount: "",
        category: "",
        description: "",
        expenseDate: new Date().toISOString().split("T")[0],
      });
      onRefresh();
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        "Something went wrong";
      toast("Unable to add expense", {
        description: String(message),
      });
    }
  };

  return (
    <Card className="w-full lg:max-w-sm shrink-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlusCircle className="h-5 w-5" />
          Add Expense
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form id="add-expense-form" onSubmit={onAdd}>
          <div className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                value={expense.amount}
                onChange={(e) =>
                  setExpense({ ...expense, amount: e.target.value })
                }
                type="number"
                placeholder="5000"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={expense.category}
                onChange={(e) =>
                  setExpense({ ...expense, category: e.target.value })
                }
                type="text"
                placeholder="Food"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={expense.description}
                onChange={(e) =>
                  setExpense({ ...expense, description: e.target.value })
                }
                type="text"
                placeholder="Optional"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="expenseDate">Date</Label>
              <Input
                id="expenseDate"
                value={expense.expenseDate}
                onChange={(e) =>
                  setExpense({ ...expense, expenseDate: e.target.value })
                }
                type="date"
                required
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button
          form="add-expense-form"
          type="submit"
          className="w-full flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Expense
        </Button>
      </CardFooter>
    </Card>
  );
};
