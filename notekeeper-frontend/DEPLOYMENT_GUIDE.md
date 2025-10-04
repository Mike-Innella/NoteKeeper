# NoteKeeper Frontend Deployment Guide

## Vercel Deployment Configuration

Your frontend code is now ready for deployment. Follow these steps to complete the setup:

### 1. Configure Environment Variable in Vercel Dashboard

1. Go to your Vercel project: https://vercel.com/dashboard
2. Select your `note-keeper` project
3. Click on **Settings** tab
4. Navigate to **Environment Variables** (in the left sidebar)
5. Add the following variable:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://notekeeper-eix8.onrender.com`
   - **Environment**: Select all (Production, Preview, Development)
6. Click **Save**

### 2. Redeploy Your Application

After adding the environment variable:
1. Go to the **Deployments** tab in Vercel
2. Find your latest deployment
3. Click the three dots menu (⋮) and select **Redeploy**
4. Confirm the redeployment

### 3. Verify the Deployment

Once redeployed, your app should be working at: https://note-keeper-lac.vercel.app/

Test the following:
- [ ] Can load the homepage
- [ ] Can register a new account
- [ ] Can log in
- [ ] Can create notes
- [ ] Can edit/delete notes

## Local Development

For local development, the app will automatically use the backend at `http://localhost:5000` as configured in `.env.local`.

To run locally:
```bash
npm run dev
```

## Troubleshooting

### If the app can't connect to the backend:
1. Check browser console for errors (F12 → Console tab)
2. Verify the backend is running at https://notekeeper-eix8.onrender.com
3. Ensure the environment variable is correctly set in Vercel

### Common Issues:
- **CORS errors**: Backend is already configured to accept requests from your Vercel domain
- **API connection failed**: Make sure the `VITE_API_URL` environment variable is set correctly
- **Render backend sleeping**: First request might take 30-50 seconds if the backend was idle

## Backend Information
- **Render URL**: https://notekeeper-eix8.onrender.com
- **Health Check Endpoint**: https://notekeeper-eix8.onrender.com/
- **Note**: Render free tier services may sleep after 15 minutes of inactivity
