import { z } from "zod";

export const onBoardingSchema = z.object({
  username: z.string().min(2, "Username must be atleast 2 letters"),
  budget: z.coerce.number().min(0, "Budget cannot be below 0"),
});
