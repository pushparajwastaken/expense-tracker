import { z } from "zod";

export const expenseCategories = [
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
] as const;

export const currencies = ["INR", "USD", "EUR"] as const;
export const frequencies = ["weekly", "monthly", "yearly"] as const;

const optionalDate = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  return value instanceof Date ? value : new Date(String(value));
}, z.date().optional());

const requiredDate = z.preprocess((value) => {
  return value instanceof Date ? value : new Date(String(value));
}, z.date());

const amount = z.coerce.number().positive("Amount should be greater than 0");
const category = z.enum(expenseCategories);
const currency = z.enum(currencies).default("INR");

export const createExpenseSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("expense"),
    amount,
    category,
    note: z.string().trim().optional(),
    currency,
    date: optionalDate,
  }),
  z.object({
    type: z.literal("recurring"),
    title: z.string().trim().min(1, "Title is required"),
    amount,
    category,
    note: z.string().trim().optional(),
    currency,
    frequency: z.enum(frequencies),
    nextDueDate: requiredDate,
  }),
]);

export const updateExpenseSchema = z
  .object({
    amount: amount.optional(),
    category: category.optional(),
    note: z.string().trim().optional(),
    currency: currency.optional(),
    date: optionalDate,
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "No data provided to update",
  });

export const expenseQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(10),
  page: z.coerce.number().int().min(1).default(1),
  category: category.optional(),
});

export const recurringQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(10),
  page: z.coerce.number().int().min(1).default(1),
});

export const updateRecurringSchema = z
  .object({
    title: z.string().trim().min(1).optional(),
    amount: amount.optional(),
    category: category.optional(),
    note: z.string().trim().optional(),
    currency: currency.optional(),
    frequency: z.enum(frequencies).optional(),
    nextDueDate: optionalDate,
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "No data provided to update",
  });
