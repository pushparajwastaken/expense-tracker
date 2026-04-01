import { getUser } from "@/helper/getUser";
import ExpenseModel from "@/model/expense.model";
import dbConnect from "@/lib/dbConnect";
import { success, error } from "@/helper/apiResponse";
import { parseExpense } from "@/lib/llm/parseExpense";
export async function POST(request: Request) {
  await dbConnect();
  try {
    const user = await getUser();
    if (!user?._id) {
      return error("Unauthorized", 401);
    }
    const body = await request.json();
    if (!body?.note) {
      return error("Note is required", 400);
    }
    const parsed = await parseExpense(body.note);
    const expense = await ExpenseModel.create({
      ...parsed,
      userId: user._id,
    });
    return success(expense);
  } catch (err: any) {
    console.error("Error updating the expense", err);
    return error(err?.message || "Something went wrong", 400);
  }
}

export async function GET(request: Request) {
  await dbConnect();
  try {
    const user = await getUser();
    if (!user?._id) {
      return error("Unauthorized", 401);
    }
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get("limit")) || 10;
    const page = Number(searchParams.get("page") || 1);
    const category = searchParams.get("category");
    const query: any = {
      userId: user._id,
    };
    if (category) {
      //with the help of this we can inject category from the url in our db call to get category wise expenses
      query.category = category;
    }

    const expenses = await ExpenseModel.find(query)
      .sort({ date: -1 }) //sort the expenses model in descending order,i.e.,the newest expenses first
      .skip((page - 1) * limit) //based on the page we will skip the expenses so as to not show the previous page expenses in our new page
      .limit(limit);
    const total = await ExpenseModel.countDocuments(query);

    return success({
      expenses,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err: any) {
    console.error("Error fetching expenses", err);
    return error(err.message, 400);
  }
}
