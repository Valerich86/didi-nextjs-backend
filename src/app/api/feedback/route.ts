import { NextResponse } from "next/server";
import { z } from "zod";

const isValidName = (text: string) => {
  if (!text || text.trim().length === 0) return false;
  const regex = /^[\p{L}\s]+$/u;
  return regex.test(text);
};

const isValidMessage = (text: string) => {
  if (!text || text.trim().length === 0) return false;
  const regex = /^[\p{L}\p{N}\s.,!?—–-]+$/u;
  return regex.test(text);
};

export async function POST(request: Request) {
  const { name, message } = await request.json();
  let errors: { name?: string; message?: string } = {};

  if (!isValidName(name)) {
    errors["name"] = "Поле не заполнено или заполнено неверно";
  }
  if (!isValidMessage(message)) {
    errors["message"] = "Поле не заполнено или заполнено неверно";
  }
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors: errors }, { status: 400 });
  }

  return NextResponse.json(
    { success: true, received: { name, message } },
    { status: 200 },
  );
}
