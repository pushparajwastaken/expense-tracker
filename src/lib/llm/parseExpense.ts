import { model } from "../gemini";
import { expenseLLMSchema } from "@/validators/expense.schema";
// ✅ Clean Gemini response
function cleanJSON(text: string) {
  return text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
}
function extractJSON(text: string) {
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");

  if (first === -1 || last === -1) {
    throw new Error("No JSON found in LLM response");
  }

  return text.slice(first, last + 1);
}
export async function parseExpense(input: string) {
  const prompt = `
You are a strict JSON generator.

Extract structured financial data.

Return ONLY valid JSON:
{
  "type": "expense" | "recurring",
  "amount": number,
  "category": "...",
  "title": string,
  "note": string,
  "currency": "INR",
  "frequency": "weekly" | "monthly" | "yearly" | null,
  "nextDueDate": string (ISO date or null)
}

Categories:
["Food","Travel","Rent","Shopping","Other","Books","Healthcare","Mobile","Internet","Utilities","Transportation","Groceries","Stationery","Projects","Online Courses","Parties","Travels","Gym","Repairs"]

Rules:
- Detect recurring if words like "every", "monthly", "weekly"
- Otherwise type = "expense"
- title = short name (e.g. "Netflix", "Swiggy", "Uber")
- note = optional extra detail
- Extract numeric amount only
- Default currency = INR
- If recurring → include frequency + nextDueDate (use today's date if not specified)
- If not recurring → frequency = null, nextDueDate = null
- Keep title short (1-2 words)
- No markdown, no explanation

Input: "${input}"
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const cleaned = cleanJSON(text);
    const jsonString = extractJSON(cleaned);
    let parsed = JSON.parse(jsonString);
    // 🔥 Rule-based override (VERY IMPORTANT)
    const lower = input.toLowerCase();

    const isRecurringHint =
      lower.includes("every") ||
      lower.includes("monthly") ||
      lower.includes("weekly") ||
      lower.includes("per month") ||
      lower.includes("each month");

    if (!isRecurringHint) {
      parsed.type = "expense";
      parsed.frequency = null;
      parsed.nextDueDate = null;
    }
    if (parsed.category) {
      parsed.category =
        parsed.category.charAt(0).toUpperCase() +
        parsed.category.slice(1).toLowerCase();
    }

    if (!parsed.title) {
      parsed.title = parsed.note || input;
    }

    if (parsed.type === "recurring" && !parsed.frequency) {
      parsed.type = "expense";
    }
    if (parsed.nextDueDate) {
      parsed.nextDueDate = new Date(parsed.nextDueDate);
    }

    return expenseLLMSchema.parse(parsed);
  } catch (err) {
    console.error("LLM parse failed:", err);

    return {
      type: "expense",
      amount: 0,
      category: "Other",
      title: input.slice(0, 20),
      note: input,
      currency: "INR",
      frequency: null,
      nextDueDate: null,
    };
  }
}
