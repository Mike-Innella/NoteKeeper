# NoteKeeper Backend - PostgreSQL Deployment Guide

## Overview
This guide will help you migrate your NoteKeeper backend from file-based storage to PostgreSQL on Render.

## Prerequisites
- Render account with your backend already deployed
- Access to your Render dashboard

## Step 1: Create PostgreSQL Database on Render

1. Log in to your [Render Dashboard](https://dashboard.render.com/)
2. Click on **"New +"** → **"PostgreSQL"**
3. Configure your database:
   - **Name**: `notekeeper-db` (or your preference)
   - **Database**: Leave as default
   - **User**: Leave as default  
   - **Region**: Choose the same region as your web service
   - **PostgreSQL Version**: 15 or latest
   - **Plan**: Free tier is sufficient for starting
4. Click **"Create Database"**
5. Wait for the database to be created (usually takes 1-2 minutes)

## Step 2: Connect Database to Your Web Service

1. In your Render dashboard, go to your **Web Service** (notekeeper backend)
2. Go to the **"Environment"** tab
3. Add the following environment variables:
   - The `DATABASE_URL` should be automatically available if you connect the database
   - To connect: Click **"Add Environment Variable"** → **"Add from database"** → Select your PostgreSQL database
   - Ensure you have `JWT_SECRET` set (if not already present)
   - Set `NODE_ENV` to `production`

### Manual Database URL (if auto-connect doesn't work)
1. Go to your PostgreSQL database in Render
2. Copy the **External Database URL** from the database info page
3. Add it as `DATABASE_URL` environment variable in your web service

## Step 3: Deploy Updated Code

### Option A: Auto-Deploy from GitHub
If you have auto-deploy configured:
1. Commit and push your changes to GitHub:
   ```bash
   git add .
   git commit -m "Migrate to PostgreSQL database"
   git push origin main
   ```
2. Render will automatically detect the changes and redeploy

### Option B: Manual Deploy
1. In your Render web service dashboard
2. Click **"Manual Deploy"** → **"Deploy latest commit"**

## Step 4: Run Database Migration

After deployment completes:

1. In your Render web service dashboard, go to the **"Shell"** tab
2. Run the migration command:
   ```bash
   node migrate-to-postgres.js
   ```
3. You should see output like:
   ```
   Starting migration to PostgreSQL...
   ✓ Database tables initialized
   Migrating 1 users...
   ✓ Migrated user: mainnella@gmail.com
   Migrating 3 notes...
   ✓ Migrated note: "First Note"
   ...
   ✅ Migration completed successfully!
   ```

## Step 5: Verify Everything Works

1. Test your application:
   - Try logging in
   - Create a new note
   - Edit an existing note
   - Delete a note
   
2. Verify persistence:
   - Create a note
   - Restart your service (Manual Deploy → Clear build cache & deploy)
   - Check if the note still exists after restart

## Step 6: Cleanup (Optional)

Once you've verified everything works:
1. The old JSON files in `/db` folder are no longer needed
2. You can safely delete the `/db` folder and the old `lib/db.js` file
3. Keep `migrate-to-postgres.js` for reference or delete if no longer needed

## Troubleshooting

### Database Connection Issues
- Ensure `DATABASE_URL` is properly set in environment variables
- Check that the database is in the same region as your web service
- Verify the database is active and running

### Migration Failures
- Check the Shell logs for specific error messages
- Ensure all environment variables are set correctly
- Try running the migration script again

### Notes Not Showing Up
- Verify the migration completed successfully
- Check that notes have the correct `user_id` assigned
- Look at the application logs for any errors

## Environment Variables Summary

Your Render service should have these environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://...` (auto-provided by Render) |
| `JWT_SECRET` | Secret key for JWT tokens | `your-secret-key-here` |
| `NODE_ENV` | Environment setting | `production` |
| `PORT` | Server port (optional, Render provides this) | `5000` |

## Local Development

For local development with PostgreSQL:

1. Install PostgreSQL locally
2. Create a database: `createdb notekeeper`
3. Copy `.env.example` to `.env`
4. Update `DATABASE_URL` in `.env` with your local PostgreSQL credentials
5. Run `npm run dev` to start the development server

## Support

If you encounter issues:
1. Check the Render service logs
2. Verify all environment variables are set
3. Ensure the database is running and accessible
4. Review the migration output for any errors

## Success Indicators

You'll know the migration is successful when:
- ✅ The migration script completes without errors
- ✅ You can log in and see your existing notes
- ✅ New notes persist after server restarts
- ✅ The application performs faster than with file-based storage
