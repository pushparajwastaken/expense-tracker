import { getUser } from "@/helper/getUser";
import ExpenseModel from "@/model/expense.model";
import dbConnect from "@/lib/dbConnect";
import RecurringPaymentModel from "@/model/recurring.model";
import { success, error } from "@/helper/apiResponse";
import {
  createExpenseSchema,
  expenseQuerySchema,
} from "@/validators/expense.schema";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const user = await getUser();
    if (!user?._id) {
      return error("Unauthorized", 401);
    }

    const parsed = createExpenseSchema.parse(await request.json());

    if (parsed.type === "recurring") {
      const recurring = await RecurringPaymentModel.create({
        userId: user._id,
        title: parsed.title,
        amount: parsed.amount,
        category: parsed.category,
        note: parsed.note,
        currency: parsed.currency,
        frequency: parsed.frequency,
        nextDueDate: parsed.nextDueDate,
      });

      return success(recurring, 201);
    }

    const expense = await ExpenseModel.create({
      userId: user._id,
      amount: parsed.amount,
      category: parsed.category,
      note: parsed.note,
      currency: parsed.currency,
      date: parsed.date,
    });

    return success(expense, 201);
  } catch (err) {
    console.error("Error creating expense", err);
    return error(err instanceof Error ? err.message : "Something went wrong", 400);
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
    const parsed = expenseQuerySchema.parse({
      limit: searchParams.get("limit") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      category: searchParams.get("category") ?? undefined,
    });

    const query: {
      userId: string;
      category?: string;
    } = {
      userId: user._id,
    };

    if (parsed.category) {
      query.category = parsed.category;
    }

    const expenses = await ExpenseModel.find(query)
      .sort({ date: -1 })
      .skip((parsed.page - 1) * parsed.limit)
      .limit(parsed.limit);
    const total = await ExpenseModel.countDocuments(query);

    return success({
      expenses,
      total,
      page: parsed.page,
      pages: Math.ceil(total / parsed.limit),
    });
  } catch (err) {
    console.error("Error fetching expenses", err);
    return error(err instanceof Error ? err.message : "Something went wrong", 400);
  }
}
