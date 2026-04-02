import dbConnect from "@/lib/dbConnect";
import { getUser } from "@/helper/getUser";
import { success, error } from "@/helper/apiResponse";
import jwt from "jsonwebtoken";

export async function POST() {
  await dbConnect();

  const user = await getUser();
  if (!user?._id) return error("Unauthorized", 401);

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
    expiresIn: "10m",
  });

  const bot = process.env.TELEGRAM_BOT_USERNAME;

  return success({
    link: `https://t.me/${bot}?start=${token}`,
  });
}
