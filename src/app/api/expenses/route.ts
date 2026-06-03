import { getSession } from "../../../lib/checkSession";
import { pool } from "@/lib/db";

export async function GET(req: Request) {
  const user = await getSession();
}
export async function POST(req: Request) {}
