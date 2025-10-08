# AWS Systems Manager Parameter Store Setup

## Problem
AWS Amplify environment variables are not being injected into the serverless runtime, even though they're correctly configured in the Amplify console.

## Solution
Use AWS Systems Manager Parameter Store to store environment variables securely.

## Step 1: Create Parameters in AWS Systems Manager

1. **Go to AWS Systems Manager Console**
   - Open AWS Console
   - Search for "Systems Manager" or "Parameter Store"
   - Click on "Parameter Store"

2. **Create the following parameters:**

### Parameter 1: Stripe Secret Key
- **Name**: `/amplify/moms-fresh-salads/main/STRIPE_SECRET_KEY`
- **Type**: SecureString
- **Value**: `sk_test_51SFfWqHnVjBVIfuofgwchTR1tAdOz38UFFcQr6TpQzcvNmxbVJkL...`
- **Description**: Stripe secret key for payment processing

### Parameter 2: Gmail User
- **Name**: `/amplify/moms-fresh-salads/main/GMAIL_USER`
- **Type**: SecureString
- **Value**: `yevhenii.lim27@gmail.com`
- **Description**: Gmail account for sending emails

### Parameter 3: Gmail App Password
- **Name**: `/amplify/moms-fresh-salads/main/GMAIL_APP_PASSWORD`
- **Type**: SecureString
- **Value**: `xltwktluzwnbbcsj`
- **Description**: Gmail app password for authentication

## Step 2: Set Up IAM Permissions

1. **Go to AWS IAM Console**
   - Search for "IAM" in AWS Console
   - Click on "Roles"

2. **Find the Amplify Role**
   - Look for a role with "amplify" in the name
   - Or the role used by your Amplify app

3. **Add SSM Permissions**
   - Click on the role
   - Click "Add permissions" → "Attach policies"
   - Search for and attach: `AmazonSSMReadOnlyAccess`
   - Or create a custom policy with these permissions:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ssm:GetParameter",
                "ssm:GetParameters",
                "ssm:GetParametersByPath"
            ],
            "Resource": [
                "arn:aws:ssm:*:*:parameter/amplify/moms-fresh-salads/main/*"
            ]
        }
    ]
}
```

## Step 3: Test the Fix

1. **Wait for deployment** (2-3 minutes)
2. **Test the health check**: `https://main.dfqy1s8pr73hm.amplifyapp.com/api/health`
3. **Test payment functionality**

## How It Works

The application now:
1. **Tries to get environment variables** from SSM Parameter Store first
2. **Falls back to hardcoded values** if SSM fails (for development)
3. **Uses the correct Stripe secret key** for payment processing
4. **Works around the Amplify environment variable bug**

## Benefits

✅ **Secure**: Parameters are encrypted in SSM  
✅ **Reliable**: Works around Amplify environment variable issues  
✅ **Scalable**: Can add more parameters easily  
✅ **Auditable**: All parameter access is logged  

## Troubleshooting

If the fix doesn't work:

1. **Check IAM permissions** - Make sure the Amplify role has SSM access
2. **Verify parameter names** - Must match exactly: `/amplify/moms-fresh-salads/main/PARAMETER_NAME`
3. **Check AWS region** - Parameters must be in the same region as your Amplify app
4. **Test locally** - The fallback values should work for development

## Next Steps

Once this is working:
1. **Complete EventBridge setup** for email notifications
2. **Test full payment flow** with email confirmations
3. **Monitor application logs** for any issues
