import { getSession } from "../../../lib/checkSession";
import { pool } from "@/lib/db";
export async function POST(req: Request) {
  try {
    const user = await getSession();
    const { budget } = await req.json();
    if (!budget || budget < 0) {
      return Response.json(
        {
          error: "Invalid Budget",
        },
        {
          status: 400,
        },
      );
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
