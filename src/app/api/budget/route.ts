import { getSession } from "../../../lib/checkSession";
import { budgetSchema } from "@/schema/budgetSchema";
import { pool } from "@/lib/db";
export async function POST(req: Request) {
  try {
    const user = await getSession();
    const body = await req.json();
    const budget = budgetSchema.safeParse(body);
    if (!budget.success) {
      return Response.json({ errors: budget.error.flatten() }, { status: 400 });
    }
    await pool.query(
      `
        UPDATE users SET budget=$1 WHERE id=$2`,
      [budget, user.id],
    );
    return Response.json({
      message: "Budget updated successfully",
    });
  } catch (error: any) {
    return Response.json(
      {
        error: error.message,
      },
      {
        status: 401,
      },
    );
  }
}
