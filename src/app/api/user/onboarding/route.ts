import { getUser } from "@/helper/getUser";
import { error, success } from "@/helper/apiResponse";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user.model";
import { onBoardingSchema } from "@/validators/onBoarding.schema";

export async function PATCH(request: Request) {
  await dbConnect();

  try {
    const user = await getUser();
    if (!user?._id) {
      return error("Unauthorized", 401);
    }

    const parsed = onBoardingSchema.parse(await request.json());
    const updatedUser = await UserModel.findByIdAndUpdate(
      user._id,
      {
        username: parsed.username,
        budget: parsed.budget,
        isOnBoarded: true,
      },
      {
        new: true,
        runValidators: true,
      },
    ).select("username email budget isOnBoarded");

    if (!updatedUser) {
      return error("User not found", 404);
    }

    return success(updatedUser);
  } catch (err) {
    console.error("Error updating onboarding", err);
    return error(err instanceof Error ? err.message : "Something went wrong");
  }
}
