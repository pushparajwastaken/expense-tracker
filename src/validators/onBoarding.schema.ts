import { z } from "zod";

export const onBoardingSchema = z.object({
  username: z.string().min(2, "Username must be atleast 2 letters"),
  budget: z.coerce.number().positive("Budget should always be positive"),
});
