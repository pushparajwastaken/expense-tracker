import { getUser } from "@/helper/getUser";
import { error, success } from "@/helper/apiResponse";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user.model";

export async function GET() {
  await dbConnect();

  try {
    const user = await getUser();
    if (!user?._id) {
      return error("Unauthorized", 401);
    }

    const dbUser = await UserModel.findById(user._id).select(
      "username email budget isOnBoarded",
    );

    if (!dbUser) {
      return error("User not found", 404);
    }

    return success({
      _id: dbUser._id,
      username: dbUser.username,
      email: dbUser.email,
      budget: dbUser.budget ?? 0,
      isOnBoarded: dbUser.isOnBoarded,
    });
  } catch (err) {
    console.error("Error getting user", err);
    return error(err instanceof Error ? err.message : "Something went wrong");
  }
}
