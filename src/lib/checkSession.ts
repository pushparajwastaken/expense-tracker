import { getServerSession } from "next-auth";
import { authOptions } from "../app/api/auth/[...nextauth]/route";
export async function getSession() {
  const session = await getServerSession(authOptions);
  console.log("SESSION", session);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user;
}
