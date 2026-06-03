import { getSession } from "../../../lib/checkSession";
import { pool } from "@/lib/db";
import { expenseSchema } from "@/schema/expenseSchema";
export async function GET() {
  try {
    const user = await getSession();

    const expenses = await pool.query(
      `
      SELECT *
      FROM expenses
      WHERE user_id = $1
      ORDER BY expense_date DESC
      `,
      [user.id],
    );

    return Response.json({
      success: true,
      expenses: expenses.rows,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
export async function POST(req: Request) {
  try {
    const user = await getSession();
    const body = await req.json();

    const result = expenseSchema.safeParse(body);

    if (!result.success) {
      return Response.json(
        {
          errors: result.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { amount, category, description, expenseDate } = result.data;
    const expense = await pool.query(
      `
  INSERT INTO expenses (
    id,
    user_id,
    category,
    amount,
    description,
    expense_date
  )
  VALUES ($1,$2,$3,$4,$5,$6)
  `,
      [
        crypto.randomUUID(),
        user.id,
        category,
        amount,
        description,
        expenseDate,
      ],
    );
    return Response.json({
      success: true,
      message: "Expense added successfully",
      expense: expense.rows[0],
    });
  } catch (error) {
    return Response.json(
      {
        error: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
