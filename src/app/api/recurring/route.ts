import { getUser } from "@/helper/getUser";
import { error, success } from "@/helper/apiResponse";
import dbConnect from "@/lib/dbConnect";
import RecurringPaymentModel from "@/model/recurring.model";
import { recurringQuerySchema } from "@/validators/expense.schema";

export async function GET(request: Request) {
  await dbConnect();

  try {
    const user = await getUser();
    if (!user?._id) {
      return error("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const parsed = recurringQuerySchema.parse({
      limit: searchParams.get("limit") ?? undefined,
      page: searchParams.get("page") ?? undefined,
    });

    const query = { userId: user._id };
    const recurringPayments = await RecurringPaymentModel.find(query)
      .sort({ nextDueDate: 1 })
      .skip((parsed.page - 1) * parsed.limit)
      .limit(parsed.limit);
    const total = await RecurringPaymentModel.countDocuments(query);

    return success({
      recurringPayments,
      total,
      page: parsed.page,
      pages: Math.ceil(total / parsed.limit),
    });
  } catch (err) {
    console.error("Error fetching recurring payments", err);
    return error(err instanceof Error ? err.message : "Something went wrong");
  }
}
