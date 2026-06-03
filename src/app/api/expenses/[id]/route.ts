import { getSession } from "@/lib/checkSession";
import { pool } from "@/lib/db";
import { expenseSchema } from "@/schema/expenseSchema";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getSession();
    const expenseId = params.id;
    const request = await req.json();
    const result = expenseSchema.safeParse(request);

    if (!result.success) {
      return Response.json(
        {
          errors: result.error.flatten(),
        },
        { status: 400 },
      );
    }
    const { amount, category, description, expenseDate } = result.data;
    const updatedExpense = await pool.query(
      `
    UPDATE expenses SET
    amount=$1,
    category=$2,
    description=$3,
    expense_date=$4
    WHERE id=$5 AND user_id=$6
    RETURNING *
    `,
      [amount, category, description, expenseDate, expenseId, user.id],
    );
    if (updatedExpense.rows.length === 0) {
      return Response.json({ error: "Expense not found" }, { status: 404 });
    }

    return Response.json({
      success: true,
      expense: updatedExpense.rows[0],
    });
  } catch (error) {
    console.error(error);

    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getSession();
    const expenseId = params.id;
    const deletedExpense = await pool.query(
      `
      DELETE FROM expenses
      WHERE id = $1
      AND user_id = $2
      RETURNING *
      `,
      [expenseId, user.id],
    );

    if (deletedExpense.rows.length === 0) {
      return Response.json(
        {
          success: false,
          error: "Expense not found",
        },
        { status: 404 },
      );
    }

    return Response.json({
      success: true,
      deletedExpense: deletedExpense.rows[0],
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
