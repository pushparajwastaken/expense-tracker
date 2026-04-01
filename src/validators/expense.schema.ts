import { z } from "zod";

export const expenseLLMSchema = z.object({
  amount: z.number().min(0, "Amount must be greater than 0"),
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
  note: z.string(),
  currency: z.string().default("INR"),
});
