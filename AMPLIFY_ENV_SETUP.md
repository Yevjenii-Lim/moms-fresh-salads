# AWS Amplify Environment Variables Setup

## Problem
The application is getting 500 errors because environment variables are not being loaded properly in the Amplify deployment.

## Solution
Set up environment variables correctly in AWS Amplify Console.

## Step 1: Go to AWS Amplify Console

1. **Open AWS Console**
   - Go to https://console.aws.amazon.com/
   - Search for "Amplify" and click on it

2. **Select Your App**
   - Find your app: `moms-fresh-salads`
   - Click on it

## Step 2: Set Environment Variables

1. **Navigate to Environment Variables**
   - In your app, go to **App Settings** (left sidebar)
   - Click on **Environment Variables**

2. **Add the Required Variables**

   Click **Manage Variables** and add these three variables:

   ### Variable 1: Stripe Secret Key
   - **Variable Name**: `STRIPE_SECRET_KEY`
   - **Value**: `[Your actual Stripe secret key starting with sk_test_]`
   - **Apply to**: `All branches`

   ### Variable 2: Gmail User
   - **Variable Name**: `GMAIL_USER`
   - **Value**: `yevhenii.lim27@gmail.com`
   - **Apply to**: `All branches`

   ### Variable 3: Gmail App Password
   - **Variable Name**: `GMAIL_APP_PASSWORD`
   - **Value**: `xltwktluzwnbbcsj`
   - **Apply to**: `All branches`

3. **Save Changes**
   - Click **Save** after adding each variable

## Step 3: Redeploy the Application

1. **Trigger a New Deployment**
   - Go back to your app's main page
   - Click **Actions** → **Redeploy this version**
   - Or make a small change to trigger a new build

2. **Wait for Deployment**
   - The deployment will take 2-3 minutes
   - You can monitor progress in the **Deployments** tab

## Step 4: Test the Fix

1. **Check Health Endpoint**
   - Visit: `https://main.dfqy1s8pr73hm.amplifyapp.com/api/health`
   - Should show environment variables as "present"

2. **Test Payment**
   - Try making a payment on your website
   - Should work without 500 errors

## Expected Results

After setup, the health check should show:
```json
{
  "stripeKey": "present",
  "gmailUser": "present", 
  "gmailPassword": "present",
  "stripeInitialized": "yes"
}
```

## Troubleshooting

If environment variables still show as "missing":

1. **Check Variable Names**
   - Ensure exact spelling: `STRIPE_SECRET_KEY`, `GMAIL_USER`, `GMAIL_APP_PASSWORD`
   - No extra spaces or typos

2. **Check Branch Scope**
   - Make sure variables are set for "All branches"
   - Or specifically for your "main" branch

3. **Force Redeploy**
   - Sometimes a simple redeploy doesn't pick up new environment variables
   - Try making a small code change to force a fresh build

4. **Check Amplify Logs**
   - Go to **Build history** → Click on latest build
   - Look for any errors related to environment variables

## Alternative: Use AWS Systems Manager Parameter Store

If Amplify environment variables continue to fail, we can set up AWS Systems Manager Parameter Store as described in `AMPLIFY_SSM_SETUP.md`.

## Next Steps

Once environment variables are working:
1. ✅ **Payment functionality** will work
2. ✅ **Email notifications** will work via EventBridge
3. ✅ **Full application** will be functional

Let me know once you've set up the environment variables and we can test the fix!
