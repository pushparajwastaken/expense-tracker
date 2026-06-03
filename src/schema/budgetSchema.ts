import { z } from "zod";

export const budgetSchema = z.object({
  budget: z
    .number()
    .positive("Budget must be greater than 0")
    .max(1000000, "Budget is too large"),
});
