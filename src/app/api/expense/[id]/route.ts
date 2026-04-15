import { getUser } from "@/helper/getUser";
import mongoose from "mongoose";
import ExpenseModel from "@/model/expense.model";
import dbConnect from "@/lib/dbConnect";
import { success, error } from "@/helper/apiResponse";
import { updateExpenseSchema } from "@/validators/expense.schema";

type ExpenseRouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: ExpenseRouteContext) {
  await dbConnect();

  try {
    const user = await getUser();
    if (!user?._id) {
      return error("Unauthorized", 401);
    }

    const { id: expenseId } = await params;
    if (!mongoose.Types.ObjectId.isValid(expenseId)) {
      return error("Invalid expense ID", 400);
    }

    const updateData = updateExpenseSchema.parse(await request.json());
    const updatedExpense = await ExpenseModel.findOneAndUpdate(
      {
        _id: expenseId,
        userId: user._id,
      },
      {
        $set: updateData,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedExpense) {
      return error("Expense not found or unauthorized", 404);
    }

    return success(updatedExpense);
  } catch (err) {
    console.error("Error updating the expense", err);
    return error(err instanceof Error ? err.message : "Something went wrong", 400);
  }
}

export async function DELETE(
  _request: Request,
  { params }: ExpenseRouteContext,
) {
  await dbConnect();

  try {
    const user = await getUser();
    if (!user?._id) {
      return error("Unauthorized", 401);
    }

    const { id: expenseId } = await params;
    if (!mongoose.Types.ObjectId.isValid(expenseId)) {
      return error("Invalid expense ID", 400);
    }

    const deletedExpense = await ExpenseModel.findOneAndDelete({
      _id: expenseId,
      userId: user._id,
    });

    if (!deletedExpense) {
      return error("Expense not found or unauthorized", 404);
    }

    return success("Successfully deleted the expense");
  } catch (err) {
    console.error("Error deleting the expense", err);
    return error(err instanceof Error ? err.message : "Something went wrong");
  }
}
