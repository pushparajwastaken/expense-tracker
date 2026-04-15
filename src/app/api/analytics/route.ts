import { getUser } from "@/helper/getUser";
import { success, error } from "@/helper/apiResponse";
import ExpenseModel from "@/model/expense.model";
import UserModel from "@/model/user.model";
import dbConnect from "@/lib/dbConnect";
import mongoose from "mongoose";

type TotalResult = {
  total: number;
};

type CategoryResult = {
  _id: string;
  total: number;
};

type WeekResult = {
  _id: number;
  total: number;
};

export async function GET(request: Request) {
  await dbConnect();

  try {
    const user = await getUser();
    if (!user?._id) {
      return error("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const rangeStart = from ? new Date(from) : startOfMonth;
    const rangeEnd = to ? new Date(to) : endOfMonth;
    const userId = new mongoose.Types.ObjectId(user._id);

    const totalResult = await ExpenseModel.aggregate<TotalResult>([
      {
        $match: {
          userId,
          date: {
            $gte: rangeStart,
            $lt: rangeEnd,
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
    const totalSpent = totalResult[0]?.total || 0;

    const categoryData = await ExpenseModel.aggregate<CategoryResult>([
      {
        $match: {
          userId,
          date: {
            $gte: rangeStart,
            $lt: rangeEnd,
          },
        },
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const monthResult = await ExpenseModel.aggregate<TotalResult>([
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

    const totalMonthSpent = monthResult[0]?.total || 0;
    const weekData = await ExpenseModel.aggregate<WeekResult>([
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

    const dbUser = await UserModel.findById(user._id).select("budget");
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
  } catch (err) {
    console.error("Error getting analytics", err);
    return error(err instanceof Error ? err.message : "Something went wrong");
  }
}
