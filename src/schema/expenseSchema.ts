import { z } from "zod";

export const expenseSchema = z.object({
  category: z.string().min(1, "Category is required").max(50),
  amount: z.number().positive("Amount must be positive"),
  description: z.string().max(500).optional(),
  expenseDate: z.string().min(1, "Expense date is required"),
});
