import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?._id) {
    throw new Error("Unauthorized");
  }
  return session.user;
}
