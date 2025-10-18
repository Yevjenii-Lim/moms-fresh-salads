import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing Telegram notification...');
    
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.warn('⚠️ Telegram credentials not configured');
      return NextResponse.json({ 
        success: false, 
        error: 'Telegram credentials not configured',
        botToken: botToken ? 'present' : 'missing',
        chatId: chatId ? 'present' : 'missing'
      });
    }

    const testMessage = `
🧪 *Test Telegram Notification*

✅ Telegram bot is working!
📅 Time: ${new Date().toLocaleString()}
🔧 Bot Token: ${botToken.substring(0, 8)}...
💬 Chat ID: ${chatId}
    `;

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: testMessage,
        parse_mode: 'Markdown'
      }),
    });

    const result = await response.json();

    if (response.ok && result.ok) {
      console.log('✅ Test Telegram notification sent successfully');
      return NextResponse.json({ 
        success: true, 
        message: 'Test notification sent successfully',
        telegramResponse: result
      });
    } else {
      console.error('❌ Telegram API error:', result);
      return NextResponse.json({ 
        success: false, 
        error: 'Telegram API error',
        telegramResponse: result
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Test Telegram error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}