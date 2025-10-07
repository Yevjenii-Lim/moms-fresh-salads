# 🚀 Amazon EventBridge Setup Guide

This guide will help you set up Amazon EventBridge with Stripe for reliable email notifications after successful payments.

## 📋 Prerequisites

- AWS Account with appropriate permissions
- Stripe Account with API access
- Gmail App Password configured

## 🔧 Step 1: Configure Stripe EventBridge Destination

### In Stripe Dashboard:

1. **Go to Webhooks** → **Add endpoint**
2. **Select "Amazon EventBridge"** (not webhook endpoint)
3. **Configure EventBridge settings:**
   - **AWS Account ID**: Your AWS account ID (find in AWS Console → Support → Support Center)
   - **Region**: `us-east-1` (or your preferred region)
   - **Event Bus**: `default`
   - **Source**: `stripe`

4. **Select Events**: 
   - ✅ `checkout.session.completed`

5. **Click "Add endpoint"**

## ☁️ Step 2: Set Up AWS Resources

### 2.1 Create EventBridge Rule

1. **Go to AWS EventBridge Console**
2. **Create Rule:**
   - **Name**: `stripe-checkout-completed`
   - **Event bus**: `default`
   - **Rule type**: `Event pattern`
   - **Event pattern**:
   ```json
   {
     "source": ["stripe"],
     "detail-type": ["checkout.session.completed"]
   }
   ```

3. **Add Target:**
   - **Target type**: `AWS service`
   - **Service**: `Lambda function`
   - **Function**: Select your Lambda function (create in next step)

### 2.2 Create Lambda Function

1. **Go to AWS Lambda Console**
2. **Create Function:**
   - **Function name**: `stripe-email-handler`
   - **Runtime**: `Node.js 18.x`
   - **Architecture**: `x86_64`

3. **Upload Code:**
   - Use the `email-handler.js` file from this repository
   - Create a deployment package with `package.json` dependencies

4. **Configure Environment Variables:**
   ```
   GMAIL_USER=your-email@gmail.com
   GMAIL_APP_PASSWORD=your-16-char-app-password
   BUSINESS_EMAIL=business@yourdomain.com
   ```

5. **Set Timeout**: `30 seconds`

### 2.3 Create IAM Role for Lambda

1. **Go to AWS IAM Console**
2. **Create Role:**
   - **Service**: `Lambda`
   - **Attach Policies**:
     - `AWSLambdaBasicExecutionRole`
     - Custom policy for SES (if using SES):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ses:SendEmail",
                "ses:SendRawEmail"
            ],
            "Resource": "*"
        }
    ]
}
```

### 2.4 Grant EventBridge Permission to Invoke Lambda

1. **In Lambda Console** → **Configuration** → **Permissions**
2. **Add Permission:**
   - **Principal**: `events.amazonaws.com`
   - **Action**: `lambda:InvokeFunction`
   - **Source ARN**: Your EventBridge rule ARN

## 🔄 Step 3: Update Your Application Code

### Remove Webhook Dependencies

Since you're using EventBridge, you can remove the webhook endpoint from your Next.js app:

1. **Delete** `src/app/api/webhook/route.ts`
2. **Remove webhook-related code** from `create-checkout-session/route.ts`
3. **Update environment variables** in Amplify

### Environment Variables for Amplify

Add these to your Amplify environment variables:

```
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password
BUSINESS_EMAIL=business@yourdomain.com
```

## 🧪 Step 4: Testing

### Test EventBridge Integration

1. **Make a test payment** in your application
2. **Check EventBridge Console** for events
3. **Check Lambda logs** for email processing
4. **Verify emails** are received

### Monitoring

- **EventBridge Console**: Monitor event delivery
- **Lambda Console**: Check function logs and metrics
- **CloudWatch**: Set up alarms for failures

## 🔒 Security Best Practices

1. **Use IAM roles** with minimal permissions
2. **Store secrets** in AWS Systems Manager Parameter Store or AWS Secrets Manager
3. **Enable VPC** for Lambda if needed
4. **Use HTTPS** for all communications
5. **Regularly rotate** API keys and passwords

## 🚨 Troubleshooting

### Common Issues

1. **Events not reaching Lambda**:
   - Check EventBridge rule configuration
   - Verify IAM permissions
   - Check event pattern matching

2. **Lambda function errors**:
   - Check CloudWatch logs
   - Verify environment variables
   - Test email credentials

3. **Email sending failures**:
   - Verify Gmail App Password
   - Check email quotas
   - Test with simple email first

### Debugging Steps

1. **Enable detailed logging** in Lambda
2. **Check EventBridge event history**
3. **Test with sample events**
4. **Monitor CloudWatch metrics**

## 📊 Benefits of EventBridge

- ✅ **Reliable delivery** with built-in retry
- ✅ **AWS native integration**
- ✅ **No public endpoints** required
- ✅ **Better security** model
- ✅ **Automatic scaling**
- ✅ **Built-in monitoring**

## 🔄 Migration from Webhooks

If you're migrating from webhooks:

1. **Set up EventBridge** first
2. **Test thoroughly** before removing webhooks
3. **Update monitoring** and alerting
4. **Remove webhook code** after confirmation

---

## 📞 Support

For issues with this setup:
1. Check AWS CloudWatch logs
2. Verify Stripe EventBridge configuration
3. Test with Stripe CLI for local development
4. Review AWS EventBridge documentation

**Happy coding!** 🎉
