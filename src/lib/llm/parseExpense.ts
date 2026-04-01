import { z } from "zod";
import { model } from "../gemini";
import { expenseLLMSchema } from "@/validators/expense.schema";
// ✅ Clean Gemini response
function cleanJSON(text: string) {
  return text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
}

export async function parseExpense(input: string) {
  const prompt = `
You are a strict JSON generator.

Extract structured expense data.

Return ONLY valid JSON:
{
  "amount": number,
  "category": "Food" | "Travel" | "Rent" | "Shopping" | "Other"| "Books"|
    "Healthcare"|
    "Mobile"|
    "Internet"|
    "Utilities"|
    "Transportation"|
    "Groceries"|
    "Stationery"|
    "Projects"|
    "Online Courses"|
    "Parties"|
    "Travels"|
    "Gym"|
    "Repairs",
  "note": string,
  "currency": "INR"
}

Rules:
- Extract numeric amount only (no symbols)
- If multiple numbers exist, choose the most relevant expense amount
- Default currency = INR
- Keep note concise (max 5 words)
- If unclear category → "Other"
- Do NOT include markdown or explanation

Expense: "${input}"
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const cleaned = cleanJSON(text);
    const parsed = JSON.parse(cleaned);

    return expenseLLMSchema.parse(parsed);
  } catch (err) {
    console.error("LLM parse failed:", err);

    // ✅ Fallback (very important)
    return {
      amount: 0,
      category: "Other",
      note: input,
      currency: "INR",
    };
  }
}
