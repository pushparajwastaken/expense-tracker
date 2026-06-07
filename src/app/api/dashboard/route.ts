import { getSession } from "@/lib/checkSession";
import { pool } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const user = await getSession();
    const [weeklyComparisons, categorySpent, budgetLeft, lastExpenses] =
      await Promise.all([
        pool.query(
          `SELECT DATE_TRUNC('week',expense_date) AS week,
        SUM(amount) AS total
        FROM expenses
        WHERE user_id=$1
        AND expense_date >=CURRENT_DATE-INTERVAL '28 Days'
        GROUP BY week
        ORDER BY week`,
          [user.id],
        ),
        pool.query(
          ` SELECT category,SUM(amount) as total FROM expenses WHERE user_id=$1
        GROUP BY category ORDER BY total DESC`,
          [user.id],
        ),
        pool.query(
          `  SELECT
      u.budget,
      u.budget - COALESCE(SUM(e.amount), 0) AS budget_left
  FROM users u
  LEFT JOIN expenses e
      ON u.id = e.user_id
      AND DATE_TRUNC('month', e.expense_date) =
          DATE_TRUNC('month', CURRENT_DATE)
  WHERE u.id = $1
  GROUP BY u.budget`,
          [user.id],
        ),
        pool.query(
          ` SELECT * from expenses WHERE user_id=$1
        ORDER BY expense_date DESC
        LIMIT 5`,
          [user.id],
        ),
      ]);
    return Response.json({
      budget: Number(budgetLeft.rows[0]?.budget ?? 0),
      budgetLeft: Number(budgetLeft.rows[0]?.budget_left ?? 0),
      weeklyComparisons: weeklyComparisons.rows,
      categorySpent: categorySpent.rows,
      lastExpenses: lastExpenses.rows,
    });
  } catch (error: any) {
    console.log(error);
    const isAuth = error.message === "Unauthorized";
    return Response.json(
      { success: false, error: error.message },
      { status: isAuth ? 401 : 500 },
    );
  }
}
