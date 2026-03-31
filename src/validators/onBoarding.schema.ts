import { z } from "zod";
type User = {
  username: string;
  email: string;
  telegramId?: string;
  isOnboarded: boolean;
  budget?: number;
  createdAt: Date;
};
export const onBoardingSchema = z.object({
  username: z.string().min(2, "Username must be atleast 2 letters"),
  budget: z.coerce.number().positive("Budget should always be positive"),
});
