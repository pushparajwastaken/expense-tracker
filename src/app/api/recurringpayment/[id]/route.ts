import { getUser } from "@/helper/getUser";

import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import { success, error } from "@/helper/apiResponse";

import RecurringPaymentModel from "@/model/recurring.model";
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
    const recurringPaymentId = searchParams.get("id");
    if (
      !recurringPaymentId ||
      !mongoose.Types.ObjectId.isValid(recurringPaymentId)
    ) {
      return error("Invalid expense ID", 400);
    }

    const body = await request.json();
    //Object.keys returns an array whose elements are strings corresponding to the enumerable strings provided in the argument
    if (!body || Object.keys(body).length === 0) {
      return error("No data provided to update", 400);
    }
    const allowedFields = [
      "amount",
      "category",
      "note",
      "date",
      "nextDueDate",
      "title",
      "interval",
      "frequency",
    ];

    const updateData: any = {};

    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updateData[key] = body[key];
      }
    }
    const updatedRecurrPayment = await RecurringPaymentModel.findOneAndUpdate(
      {
        _id: recurringPaymentId,
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
    if (!updatedRecurrPayment) {
      return error(
        "Recurring payment not found not found our unauthorized",
        404,
      );
    }
    return success(updatedRecurrPayment);
  } catch (err: any) {
    console.error("Error updating the Recurring Payment", err);
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
    const recurringPaymentId = searchParams.get("id");

    const deletedExpense = await RecurringPaymentModel.findOneAndDelete({
      _id: recurringPaymentId,
      userId: user._id,
    });
    if (!deletedExpense) {
      return error("Recurring Payment not found or unauthorized", 404);
    }
    return success("Successfully deleted the Recurring Payment");
  } catch (err: any) {
    console.error("Error deleting the Recurring Payment", err);
    return error(err?.message);
  }
}
