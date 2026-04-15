import { getUser } from "@/helper/getUser";
import { error, success } from "@/helper/apiResponse";
import dbConnect from "@/lib/dbConnect";
import RecurringPaymentModel from "@/model/recurring.model";
import { updateRecurringSchema } from "@/validators/expense.schema";
import mongoose from "mongoose";

type RecurringRouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(
  request: Request,
  { params }: RecurringRouteContext,
) {
  await dbConnect();

  try {
    const user = await getUser();
    if (!user?._id) {
      return error("Unauthorized", 401);
    }

    const { id: recurringId } = await params;
    if (!mongoose.Types.ObjectId.isValid(recurringId)) {
      return error("Invalid recurring payment ID", 400);
    }

    const updateData = updateRecurringSchema.parse(await request.json());
    const updatedRecurring = await RecurringPaymentModel.findOneAndUpdate(
      {
        _id: recurringId,
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

    if (!updatedRecurring) {
      return error("Recurring payment not found or unauthorized", 404);
    }

    return success(updatedRecurring);
  } catch (err) {
    console.error("Error updating recurring payment", err);
    return error(err instanceof Error ? err.message : "Something went wrong");
  }
}

export async function DELETE(
  _request: Request,
  { params }: RecurringRouteContext,
) {
  await dbConnect();

  try {
    const user = await getUser();
    if (!user?._id) {
      return error("Unauthorized", 401);
    }

    const { id: recurringId } = await params;
    if (!mongoose.Types.ObjectId.isValid(recurringId)) {
      return error("Invalid recurring payment ID", 400);
    }

    const deletedRecurring = await RecurringPaymentModel.findOneAndDelete({
      _id: recurringId,
      userId: user._id,
    });

    if (!deletedRecurring) {
      return error("Recurring payment not found or unauthorized", 404);
    }

    return success("Successfully deleted the recurring payment");
  } catch (err) {
    console.error("Error deleting recurring payment", err);
    return error(err instanceof Error ? err.message : "Something went wrong");
  }
}
