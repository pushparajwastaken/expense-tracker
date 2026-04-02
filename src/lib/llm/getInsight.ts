import ExpenseModel from "@/model/expense.model";
import InsightModel from "@/model/insight.model";
import UserModel from "@/model/user.model";
import { model } from "@/lib/gemini";

// helper: date window
function getWindow(type: "weekly" | "monthly") {
  const now = new Date();

  if (type === "weekly") {
    const start = new Date(now);
    start.setDate(now.getDate() - 7);
    return { start, end: now };
  }

  // monthly
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { start, end };
}

// helper: safe JSON extract
function extractJSON(text: string) {
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");

  if (first === -1 || last === -1) throw new Error("No JSON found");

  return JSON.parse(cleaned.slice(first, last + 1));
}

export async function getInsights(
  userId: string,
  type: "weekly" | "monthly" = "monthly",
) {
  //  1. check if there already exists an Insight model or not
  const existing = await InsightModel.findOne({ userId, type });

  if (existing) {
    return existing;
  }

  // 2. Date window-create a new window of few days for the insights
  const { start, end } = getWindow(type);

  // 3. Aggregations
  const [totalRes, categoryRes] = await Promise.all([
    ExpenseModel.aggregate([
      {
        $match: {
          userId,
          date: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]),

    ExpenseModel.aggregate([
      {
        $match: {
          userId,
          date: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
        },
      },
    ]),
  ]);

  const totalSpent = totalRes[0]?.total || 0;

  // 4. Convert category breakdown to Map-friendly object
  const categoryBreakdown: Record<string, number> = {};
  for (const item of categoryRes) {
    categoryBreakdown[item._id] = item.total;
  }
  const categoryWithPercent = Object.entries(categoryBreakdown).map(
    ([key, val]) => ({
      category: key,
      total: val,
      percent: totalSpent ? Math.round((val / totalSpent) * 100) : 0,
    }),
  );
  //  5. Budget
  const user = await UserModel.findById(userId).select("budget");
  const budget = user?.budget || 0;

  //  6. LLM prompt (see below)
  const prompt = `
You are a financial assistant.

Analyze the user's ${type} spending and generate insights.

Return ONLY valid JSON:
{
  "summary": string[]
}

Data:
Total spent: ${totalSpent}
Budget: ${budget}

Category breakdown:
${JSON.stringify(categoryWithPercent)}

Rules:
- Max 3 insights
- Each insight must be short (1 line)
- Focus on:
  - overspending
  - category trends
  - savings suggestions
- Mention ₹ values when useful
- If no data → return ["No spending data available"]
- No explanation, only JSON
`;

  //  7. LLM call
  let summary: string[] = [];

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const parsed = extractJSON(text);
    summary = parsed.summary || [];
  } catch (err) {
    console.error("Insight LLM failed:", err);
    summary = ["Unable to generate insights right now."];
  }

  //  8. Save (matches your model exactly)
  const insight = await InsightModel.create({
    userId,
    type,
    summary,
    categoryBreakdown,
    budget,
  });

  return insight;
}
