import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    GMAIL_USER: process.env.GMAIL_USER,
    GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD,
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
    AWS_REGION: process.env.AWS_REGION,
    DYNAMODB_MENU_TABLE_NAME: process.env.DYNAMODB_MENU_TABLE_NAME,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'eurasianbowl.s3.us-east-1.amazonaws.com',
        port: '',
        pathname: '/salads/**',
      },
    ],
  },
};

export default nextConfig;
