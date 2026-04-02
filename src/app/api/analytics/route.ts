import { getUser } from "@/helper/getUser";
import { success, error } from "@/helper/apiResponse";
import ExpenseModel from "@/model/expense.model";
import UserModel from "@/model/user.model";
import dbConnect from "@/lib/dbConnect";
export async function GET(request: Request) {
  await dbConnect();
  try {
    const user = await getUser();
    if (!user?._id) {
      return error("Unauthorized", 401);
    }
    const userId = user._id;
    //this gives a date like :-2026-04-02T14:23:45.123Z
    const now = new Date();
    //now.getFullYear-2026
    //now.getMonth-3
    //getDate-2
    //new Date(year,month,date)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    //TOTAL SPENT
    const result = await ExpenseModel.aggregate([
      {
        $match: {
          userId,
          date: {
            $gte: startOfMonth, //all expenses with date greater than startofMonth
            $lt: endOfMonth, //all expenses with date lesser than end of month
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);
    const totalSpent = result[0]?.total || 0;

    //Category Wise Spent Money
    const categoryData = await ExpenseModel.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
        },
      },
    ]);
    //Monthly Spent

    const Monthresult = await ExpenseModel.aggregate([
      {
        $match: {
          userId,
          date: {
            $gte: startOfMonth,
            $lt: endOfMonth,
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const totalMonthSpent = Monthresult[0]?.total || 0;
    //Weekly Spending
    const weekData = await ExpenseModel.aggregate([
      {
        $match: {
          userId,
          date: {
            $gte: startOfMonth,
            $lt: endOfMonth,
          },
        },
      },
      {
        $group: {
          _id: { $week: "$date" },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const dbUser = await UserModel.findById(userId).select("budget");
    const budget = dbUser?.budget || 0;
    const budgetLeft = budget - totalMonthSpent;
    return success({
      totalSpent,
      budget,
      totalMonthSpent,
      budgetLeft,
      weekData,
      categoryData,
    });
  } catch (err: any) {
    console.error("Error getting analytics", err);
    return error(err.message || "Something went wrong");
  }
}
