import { z } from "zod";

export const expenseLLMSchema = z.object({
  type: z.enum(["expense", "recurring"]),

  amount: z.number().min(0),

  category: z.enum([
    "Food",
    "Travel",
    "Rent",
    "Shopping",
    "Other",
    "Books",
    "Healthcare",
    "Mobile",
    "Internet",
    "Utilities",
    "Transportation",
    "Groceries",
    "Stationery",
    "Projects",
    "Online Courses",
    "Parties",
    "Travels",
    "Gym",
    "Repairs",
  ]),

  title: z.string().min(1), // 🔥 NEW

  note: z.string().optional(),

  currency: z.enum(["INR", "USD", "EUR"]).default("INR"),

  frequency: z.enum(["weekly", "monthly", "yearly"]).nullable().optional(),

  nextDueDate: z.string().optional(), // ISO string
});
