import { getUser } from "@/helper/getUser";
import RecurringPaymentModel from "@/model/recurring.model";
import dbConnect from "@/lib/dbConnect";
import { success, error } from "@/helper/apiResponse";

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

    const RecurringPayment = await RecurringPaymentModel.find(query)
      .sort({ date: -1 }) //sort the expenses model in descending order,i.e.,the newest expenses first
      .skip((page - 1) * limit) //based on the page we will skip the expenses so as to not show the previous page expenses in our new page
      .limit(limit);
    const total = await RecurringPaymentModel.countDocuments(query);

    return success({
      RecurringPayment,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err: any) {
    console.error("Error fetching Recurring Payments", err);
    return error(err.message, 400);
  }
}
