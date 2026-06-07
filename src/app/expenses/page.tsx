"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import API from "@/lib/axios";
import { Pencil, Trash2 } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

type Expense = {
  id: string;
  user_id: string;
  category: string;
  amount: string;
  description: string | null;
  expense_date: string;
};

type EditForm = {
  amount: string;
  category: string;
  description: string;
  expenseDate: string;
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editTarget, setEditTarget] = useState<Expense | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<EditForm>({
    amount: "",
    category: "",
    description: "",
    expenseDate: "",
  });

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get("/api/expenses");
      if (res.data?.success === false) throw new Error(res.data.error);
      setExpenses(res.data.expenses ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const openEdit = (expense: Expense) => {
    setEditTarget(expense);
    setForm({
      amount: String(expense.amount),
      category: expense.category,
      description: expense.description ?? "",
      expenseDate: expense.expense_date.split("T")[0],
    });
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    try {
      await API.patch(`/api/expenses/${editTarget.id}`, {
        amount: Number(form.amount),
        category: form.category,
        description: form.description,
        expenseDate: form.expenseDate,
      });
      toast("Expense updated");
      setEditTarget(null);
      fetchExpenses();
    } catch (error: any) {
      const message =
        error.response?.data?.error || error.message || "Something went wrong";
      toast("Failed to update", { description: message });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await API.delete(`/api/expenses/${deleteId}`);
      toast("Expense deleted");
      setDeleteId(null);
      fetchExpenses();
    } catch (error: any) {
      toast("Failed to delete", { description: error.message });
    }
  };

  const filtered = expenses.filter(
    (e) =>
      search === "" ||
      e.category.toLowerCase().includes(search.toLowerCase()) ||
      (e.description ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="dashboard-container font-mono min-w-screen">
      <nav className="navbar-root">
        <div className="logo">TrackWise</div>
        <div className="links">
          <Link href="/dashboard" className="link-items">
            Dashboard
          </Link>
          <button className="btn" onClick={() => signOut({ callbackUrl: "/" })}>
            Sign Out
          </button>
        </div>
      </nav>

      <div className="pb-10">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>All Expenses</CardTitle>
              <Input
                placeholder="Search by category or description…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:max-w-xs"
              />
            </div>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">
                {search ? "No expenses match your search." : "No expenses yet."}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-25">Category</TableHead>
                      <TableHead className="min-w-20">Amount</TableHead>
                      <TableHead className="hidden sm:table-cell min-w-30">Description</TableHead>
                      <TableHead className="min-w-22.5">Date</TableHead>
                      <TableHead className="w-20" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="font-medium">{expense.category}</TableCell>
                        <TableCell>
                          ₹{Number(expense.amount).toFixed(2)}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground">
                          {expense.description || "—"}
                        </TableCell>
                        <TableCell>
                          {new Date(expense.expense_date).toLocaleDateString(
                            "en-IN",
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 justify-end">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8"
                              onClick={() => openEdit(expense)}
                              aria-label="Edit expense"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="destructive"
                              className="h-8 w-8"
                              onClick={() => setDeleteId(expense.id)}
                              aria-label="Delete expense"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-1">
              <Label>Amount (₹)</Label>
              <Input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>
            <div className="grid gap-1">
              <Label>Category</Label>
              <Input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </div>
            <div className="grid gap-1">
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
            <div className="grid gap-1">
              <Label>Date</Label>
              <Input
                type="date"
                value={form.expenseDate}
                onChange={(e) =>
                  setForm({ ...form, expenseDate: e.target.value })
                }
              />
            </div>
            <Button onClick={handleEdit}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this expense?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
