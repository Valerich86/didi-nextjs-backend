import { NextResponse } from 'next/server';

const isValidName = (text: string | undefined) => {
  if (!text || text.trim().length === 0) return false;
  const regex = /^[\p{L}\s]+$/u;
  return regex.test(text);
};

const isValidMessage = (text: string | undefined) => {
  if (!text || text.trim().length === 0) return false;
  const regex = /^[\p{L}\p{N}\s.,!?—–-]+$/u;
  return regex.test(text);
};

async function sendToTelegram(name: string, message: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    throw new Error('Telegram credentials are missing in .env');
  }

  const text = `
📩 <b>Обратная связь из Didi</b>

👤 Имя: ${escapeHtml(name)}
💬 Сообщение:
${escapeHtml(message)}
  `.trim();

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('Telegram error:', errText);
    throw new Error(`Telegram API failed: ${errText}`);
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function POST(request: Request) {
  try {
    const { name, message } = await request.json();
    let errors: { name?: string; message?: string } = {};

    if (!isValidName(name)) {
      errors['name'] = 'Поле не заполнено или заполнено неверно (только буквы и пробелы)';
    }
    if (!isValidMessage(message)) {
      errors['message'] = 'Поле не заполнено или содержит недопустимые символы';
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    // Отправляем в Telegram
    await sendToTelegram(name, message);

    return NextResponse.json(
      { success: true, received: { name, message } },
      { status: 200 },
    );
  } catch (error) {
    console.error('Feedback handler error:', error);
    return NextResponse.json(
      { error: 'Не удалось обработать обратную связь' },
      { status: 500 },
    );
  }
}
