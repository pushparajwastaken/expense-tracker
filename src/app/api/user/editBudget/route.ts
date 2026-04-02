import UserModel from "@/model/user.model";
import { getUser } from "@/helper/getUser";
import dbConnect from "@/lib/dbConnect";
import { success, error } from "@/helper/apiResponse";
import { updateTag } from "next/cache";

type BudgetBody = {
  budget: number;
};
export async function PATCH(request: Request) {
  try {
    await dbConnect();
    const user = await getUser();
    if (!user?._id) {
      return error("Unauthorized", 403);
    }
    const { budget }: BudgetBody = await request.json();
    if (!budget) {
      return error("Budget is required", 404);
    }
    if (budget < 0) {
      return error("Budget cannot be below 0");
    }
    const updatedUser = await UserModel.findByIdAndUpdate(
      user._id,

      {
        budget,
      },
      {
        new: true,
      },
    );
    if (!updatedUser) {
      return error("User not found or unable to update");
    }
    return success(updatedUser);
  } catch (err: any) {
    console.error("Error updating the budget", err);
    return error(err?.message || "Something went wrong");
  }
}
