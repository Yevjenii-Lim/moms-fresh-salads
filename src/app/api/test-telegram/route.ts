import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    console.log('Bot Token:', botToken ? 'Present' : 'Missing');
    console.log('Chat ID:', chatId);

    if (!botToken || !chatId) {
      return NextResponse.json({
        error: 'Missing credentials',
        botToken: botToken ? 'present' : 'missing',
        chatId: chatId || 'missing'
      });
    }

    const testMessage = `
🧪 *Test Message*

This is a test message from Mom's Fresh Salads.

⏰ Time: ${new Date().toLocaleString()}

If you see this, Telegram notifications are working! ✅
    `.trim();

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: testMessage,
        parse_mode: 'Markdown',
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: 'Test message sent!',
        chatId: chatId,
        response: data
      });
    } else {
      return NextResponse.json({
        success: false,
        error: data.description || 'Failed to send',
        chatId: chatId,
        response: data
      }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

