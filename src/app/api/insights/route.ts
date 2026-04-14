import { getUser } from "@/helper/getUser";
import InsightModel from "@/model/insight.model";
import { success, error } from "@/helper/apiResponse";
import dbConnect from "@/lib/dbConnect";
import ExpenseModel from "@/model/expense.model";
function formatInsight(insight: any) {
  return {
    type: insight.type,
    summary: insight.summary,
    categoryBreakdown: Object.fromEntries(insight.categoryBreakdown || {}),
    budget: insight.budget,
    createdAt: insight.createdAt,
  };
}
export async function POST(request: Request) {
  await dbConnect();
  try {
    const user = await getUser();
    if (!user?._id) {
      return error("Unauthorized", 403);
    }
    const insights = await InsightModel.findOne({ userId: user._id });
    if (insights) {
      return success("Insights found");
    }
    const expenses = await ExpenseModel.countDocuments({
      userId: user?._id,
      createdAt: {
        $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // last 30 days
      },
    });
    const categories = await ExpenseModel.distinct("category", {
      userId: user?._id,
    });

    if (categories.length < 3) {
      return error("Not enough category diversity for insights");
    }
    if (expenses < 5) {
      return error("You need to add more than 5 expenses to generate Insights");
    }
    const insight = await getInsights(user._id, "weekly");
    return success(formatInsight(insight));
  } catch (err: any) {
    console.error("Error getting insights", err);
    return error(err?.message || "Something went wrong");
  }
}
