import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user.model";
import ExpenseModel from "@/model/expense.model";
import RecurringPaymentModel from "@/model/recurring.model";
import { parseExpense } from "@/lib/llm/parseExpense";
import { sendMessage } from "@/lib/telegram/sendMessage";
import jwt from "jsonwebtoken";
import { success } from "@/helper/apiResponse";

export async function POST(req: Request) {
  await dbConnect();

  const body = await req.json();

  const text: string = body?.message?.text;
  const chatId: number = body?.message?.chat?.id;

  if (!text || !chatId) return new Response("OK");

  try {
    // 🔗 1. LINKING FLOW
    if (text.startsWith("/start")) {
      const token = text.split(" ")[1];

      if (!token) {
        await sendMessage(
          chatId,
          "⚠️ Please open the link from the app to connect.",
        );
        return success("OK");
      }

      try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
        const chatId = String(body?.message?.chat?.id);
        const user = await UserModel.findById(decoded.userId);

        if (!user) {
          await sendMessage(chatId, "❌ Invalid link");
          return new Response("OK");
        }

        user.telegramId = chatId;
        await user.save();

        await sendMessage(
          chatId,
          "✅ Connected!\n\nNow send expenses like:\n'spent 200 on food'",
        );
      } catch {
        await sendMessage(chatId, "❌ Link expired or invalid");
      }

      return new Response("OK");
    }

    // 🔒 2. CHECK USER LINKED
    const user = await UserModel.findOne({ telegramId: chatId as any });

    if (!user) {
      await sendMessage(
        chatId,
        `⚠️ Please connect your account:\n${process.env.APP_URL}/link-telegram`,
      );
      return new Response("OK");
    }

    // 🤖 3. PARSE EXPENSE
    const parsed = await parseExpense(text);

    // ❌ Not an expense → redirect
    if (parsed.amount === 0) {
      await sendMessage(
        chatId,
        `⚠️ I can only add expenses here.\n\n👉 Open app for more features:\n${process.env.APP_URL}`,
      );
      return new Response("OK");
    }

    // 🔁 recurring
    if (parsed.type === "recurring" && parsed.frequency) {
      await RecurringPaymentModel.create({
        userId: user._id,
        title: parsed.title,
        amount: parsed.amount,
        category: parsed.category,
        note: parsed.note,
        currency: parsed.currency,
        frequency: parsed.frequency,
        nextDueDate: parsed.nextDueDate || new Date(),
      });

      await sendMessage(chatId, "🔁 Recurring payment set!");
      return new Response("OK");
    }

    // 💸 expense
    const expense = await ExpenseModel.create({
      userId: user._id,
      amount: parsed.amount,
      category: parsed.category,
      note: parsed.note,
      currency: parsed.currency,
    });

    await sendMessage(chatId, `💸 ₹${expense.amount} → ${expense.category}`);

    return new Response("OK");
  } catch (err) {
    console.error("Telegram error:", err);

    await sendMessage(
      chatId,
      `❌ Something went wrong.\n👉 Try again or open app:\n${process.env.APP_URL}`,
    );

    return new Response("OK");
  }
}
