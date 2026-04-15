import { getUser } from "@/helper/getUser";
import InsightModel, { Insight } from "@/model/insight.model";
import { success, error } from "@/helper/apiResponse";
import dbConnect from "@/lib/dbConnect";
import ExpenseModel from "@/model/expense.model";
import UserModel from "@/model/user.model";
import mongoose from "mongoose";

type CategoryTotal = {
  _id: string;
  total: number;
};

function formatInsight(insight: Insight) {
  const breakdown =
    insight.categoryBreakdown instanceof Map
      ? Object.fromEntries(insight.categoryBreakdown)
      : insight.categoryBreakdown;

  return {
    type: insight.type,
    summary: insight.summary,
    categoryBreakdown: breakdown || {},
    budget: insight.budget,
    createdAt: insight.createdAt,
  };
}

async function generateInsight(userId: string, type: "weekly" | "monthly") {
  const objectUserId = new mongoose.Types.ObjectId(userId);
  const days = type === "weekly" ? 7 : 30;
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const categoryTotals = await ExpenseModel.aggregate<CategoryTotal>([
    {
      $match: {
        userId: objectUserId,
        date: { $gte: startDate },
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

  const user = await UserModel.findById(userId).select("budget");
  const budget = user?.budget || 0;
  const totalSpent = categoryTotals.reduce((sum, item) => sum + item.total, 0);
  const topCategory = categoryTotals[0];
  const summary = [
    `You spent ${totalSpent} in the last ${days} days.`,
    topCategory
      ? `${topCategory._id} is your highest category at ${topCategory.total}.`
      : "No category has enough spending data yet.",
    budget > 0
      ? `You have ${budget - totalSpent} left from your budget for this period.`
      : "Set a budget to compare spending against a target.",
  ];

  return InsightModel.create({
    userId,
    type,
    summary,
    categoryBreakdown: Object.fromEntries(
      categoryTotals.map((item) => [item._id, item.total]),
    ),
    budget,
  });
}

export async function GET() {
  await dbConnect();

  try {
    const user = await getUser();
    if (!user?._id) {
      return error("Unauthorized", 401);
    }

    const insight = await InsightModel.findOne({ userId: user._id }).sort({
      createdAt: -1,
    });

    if (!insight) {
      return success(null);
    }

    return success(formatInsight(insight));
  } catch (err) {
    console.error("Error fetching insights", err);
    return error(err instanceof Error ? err.message : "Something went wrong");
  }
}

export async function POST() {
  await dbConnect();

  try {
    const user = await getUser();
    if (!user?._id) {
      return error("Unauthorized", 401);
    }

    const existingInsight = await InsightModel.findOne({
      userId: user._id,
    }).sort({
      createdAt: -1,
    });

    if (existingInsight) {
      return success(formatInsight(existingInsight));
    }

    const expenses = await ExpenseModel.countDocuments({
      userId: user._id,
      createdAt: {
        $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    });
    const categories = await ExpenseModel.distinct("category", {
      userId: user._id,
    });

    if (categories.length < 3) {
      return error("Not enough category diversity for insights");
    }
    if (expenses < 5) {
      return error("You need to add more than 5 expenses to generate insights");
    }

    const insight = await generateInsight(user._id, "weekly");
    return success(formatInsight(insight), 201);
  } catch (err) {
    console.error("Error generating insights", err);
    return error(err instanceof Error ? err.message : "Something went wrong");
  }
}
