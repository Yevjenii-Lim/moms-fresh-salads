import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST() {
  try {
    // Check if environment variables are set
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      return NextResponse.json(
        { 
          error: 'Gmail configuration missing',
          details: {
            GMAIL_USER: process.env.GMAIL_USER ? 'Set' : 'Missing',
            GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD ? 'Set' : 'Missing'
          }
        },
        { status: 400 }
      );
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // Test email content
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER, // Send test email to yourself
      subject: '🧪 Test Email - Mom\'s Fresh Salads',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c5530;">✅ Email Test Successful!</h2>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Test Time:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>From:</strong> ${process.env.GMAIL_USER}</p>
            <p><strong>Status:</strong> Email system is working correctly!</p>
          </div>
          <p style="color: #666;">If you received this email, your email notification system is ready to send order confirmations.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ 
      success: true, 
      message: 'Test email sent successfully!',
      sentTo: process.env.GMAIL_USER
    });

  } catch (error) {
    console.error('Email test failed:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send test email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
