import { getUser } from "@/helper/getUser";
import { error, success } from "@/helper/apiResponse";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user.model";
import { z } from "zod";

const profileSchema = z
  .object({
    username: z.string().trim().min(2).optional(),
    budget: z.coerce.number().min(0).optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "No data provided to update",
  });

export async function PATCH(request: Request) {
  await dbConnect();

  try {
    const user = await getUser();
    if (!user?._id) {
      return error("Unauthorized", 401);
    }

    const parsed = profileSchema.parse(await request.json());
    const updatedUser = await UserModel.findByIdAndUpdate(user._id, parsed, {
      new: true,
      runValidators: true,
    }).select("username email budget isOnBoarded");

    if (!updatedUser) {
      return error("User not found", 404);
    }

    return success(updatedUser);
  } catch (err) {
    console.error("Error updating profile", err);
    return error(err instanceof Error ? err.message : "Something went wrong");
  }
}
