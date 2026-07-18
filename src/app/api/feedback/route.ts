import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { name, message } = await request.json();
  console.log('Получено на бэкенде:', { name, message });
  return NextResponse.json({ success: true, received: { name, message } });
}
