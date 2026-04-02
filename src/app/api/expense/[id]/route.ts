import { getUser } from "@/helper/getUser";
import UserModel from "@/model/user.model";
import mongoose from "mongoose";
import ExpenseModel from "@/model/expense.model";
import dbConnect from "@/lib/dbConnect";
import { success, error } from "@/helper/apiResponse";
import { request } from "http";
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  await dbConnect();
  try {
    const user = await getUser();
    if (!user?._id) {
      return error("Unauthorized", 401);
    }
    const { searchParams } = new URL(request.url);
    const expenseId = searchParams.get("id");
    if (!expenseId || !mongoose.Types.ObjectId.isValid(expenseId)) {
      return error("Invalid expense ID", 400);
    }

    const body = await request.json();
    //Object.keys returns an array whose elements are strings corresponding to the enumerable strings provided in the argument
    if (!body || Object.keys(body).length === 0) {
      return error("No data provided to update", 400);
    }
    const allowedFields = ["amount", "category", "note", "date"];

    const updateData: any = {};

    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updateData[key] = body[key];
      }
    }
    const updatedExpense = await ExpenseModel.findOneAndUpdate(
      {
        _id: expenseId,
        userId: user._id,
      },
      {
        $set: updateData,
      },
      {
        new: true, //return updated doc
        runValidators: true, //enforce schema
      },
    );
    if (!updatedExpense) {
      return error("Expense not found our unauthorized", 404);
    }
    return success(updatedExpense);
  } catch (err: any) {
    console.error("Error updating the expense", err);
    return error(err?.message || "Something went wrong", 400);
  }
}
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  await dbConnect();
  try {
    const user = await getUser();
    if (!user?._id) {
      return error("Unauthorized", 403);
    }
    const { searchParams } = new URL(request.url);
    const expenseId = searchParams.get("id");

    const deletedExpense = await ExpenseModel.findOneAndDelete({
      _id: expenseId,
      userId: user._id,
    });
    if (!deletedExpense) {
      return error("Expnese not found or unauthorized", 404);
    }
    return success("Successfully deleted the expense");
  } catch (err: any) {
    console.error("Error deleting the expense", err);
    return error(err?.message);
  }
}
