import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { items, customerInfo, subtotal, discount, tax, total } = await request.json();

    console.log('💵 Cash order received');
    console.log('Customer:', customerInfo);
    console.log('Total:', total);

    // Send Telegram notification
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.warn('⚠️ Telegram credentials not configured');
      return NextResponse.json({ success: true, message: 'Order received (no notification sent)' });
    }

    const message = `
🛒 *New Cash Order* 💵

👤 *Customer:* ${customerInfo.name}
📧 *Email:* ${customerInfo.email}
📞 *Phone:* ${customerInfo.phone}
📍 *Address:* ${customerInfo.address}
${customerInfo.instructions ? `📝 *Instructions:* ${customerInfo.instructions}` : ''}

💰 *Payment Method:* CASH IN PERSON
💵 *Total to collect:* $${total.toFixed(2)}

📋 *Order Details:*
• Subtotal: $${subtotal.toFixed(2)}
• Cash Discount (5%): -$${discount.toFixed(2)}
• Tax (8%): $${tax.toFixed(2)}
• *Total: $${total.toFixed(2)}*

🛍️ *Items:*
${items.map((item: any) => `• ${item.quantity}x ${item.name} - $${(item.price * item.quantity).toFixed(2)}`).join('\n')}

⏰ *Time:* ${new Date().toLocaleString()}
    `.trim();

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    if (response.ok) {
      console.log('✅ Telegram notification sent successfully');
      return NextResponse.json({ success: true, message: 'Order received' });
    } else {
      const error = await response.text();
      console.error('❌ Telegram notification failed:', error);
      return NextResponse.json({ success: true, message: 'Order received (notification failed)' });
    }
  } catch (error) {
    console.error('❌ Cash order error:', error);
    return NextResponse.json(
      { error: 'Failed to process order' },
      { status: 500 }
    );
  }
}

