type SendOptions = {
  parseMode?: "Markdown" | "HTML";
  disableWebPagePreview?: boolean;
  replyMarkup?: any; // inline keyboard / buttons
};

export async function sendMessage(
  chatId: string | number,
  text: string,
  options: SendOptions = {},
) {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN not set");
  }

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: options.parseMode || "Markdown",
          disable_web_page_preview: options.disableWebPagePreview ?? true,
          reply_markup: options.replyMarkup,
        }),
      },
    );

    const data = await res.json();

    if (!data.ok) {
      console.error("Telegram API error:", data);
      throw new Error(data.description || "Telegram send failed");
    }

    return data.result;
  } catch (err) {
    console.error("sendMessage failed:", err);
    throw err;
  }
}
