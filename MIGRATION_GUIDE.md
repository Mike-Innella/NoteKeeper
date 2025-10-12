# NoteKeeper Migration Guide: Supabase + Render + Vercel

## Overview
This guide documents the migration of NoteKeeper from its original setup to:
- **Database**: Supabase PostgreSQL
- **Backend**: Render (Express.js API)
- **Frontend**: Vercel (React/Vite)

## Migration Steps

### 1. Database Migration (Local → Supabase)

#### Export from Render Database
```bash
# Set your Render database URL
export OLD_DB="postgresql://username:password@host.render.com:5432/dbname?ssl=true"

# Export the database
pg_dump --no-owner --no-privileges --format=plain --verbose "$OLD_DB" > render_dump.sql
```

#### Import to Supabase
```bash
# Supabase connection string (from .env.migration)
export SUPABASE_DB="postgresql://postgres:@Dult2099NK@db.pytuhhdxbdscqktvtlal.supabase.co:5432/postgres?sslmode=require"

# Optional: Create extensions
psql "$SUPABASE_DB" -c 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; CREATE EXTENSION IF NOT EXISTS "pgcrypto";'

# Import the data
psql "$SUPABASE_DB" -f render_dump.sql
```

### 2. Backend Configuration (Render)

#### Environment Variables for Render
Set these in your Render dashboard under Environment:

```env
NODE_ENV=production
PORT=10000

# Database (Supabase direct connection)
DATABASE_URL=postgresql://postgres:@Dult2099NK@db.pytuhhdxbdscqktvtlal.supabase.co:5432/postgres?sslmode=require

# JWT Secret (generate a secure one)
JWT_SECRET=your-very-secure-jwt-secret-key-here

# CORS Configuration
CORS_ORIGIN=https://e-portfolio-2025-lemon.vercel.app

# Optional Supabase Keys (for future features)
SUPABASE_URL=https://pytuhhdxbdscqktvtlal.supabase.co
SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

#### Render Settings
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Health Check Path**: `/healthz`
- **Auto-Deploy**: On (if using GitHub)

### 3. Frontend Configuration (Vercel)

#### Environment Variables for Vercel
Set these in your Vercel dashboard under Settings → Environment Variables:

```env
# Your Render backend URL
VITE_API_URL=https://notekeeper-eix8.onrender.com

# Optional Supabase (for direct client access)
VITE_SUPABASE_URL=https://pytuhhdxbdscqktvtlal.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

#### Vercel Settings
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 4. Local Development Setup

#### Backend (.env)
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:@Dult2099NK@db.pytuhhdxbdscqktvtlal.supabase.co:5432/postgres?sslmode=require
JWT_SECRET=your-dev-jwt-secret
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
```

### 5. Testing the Migration

#### Backend Tests
```bash
# Test database connection
curl https://notekeeper-eix8.onrender.com/healthz

# Test API endpoint
curl https://notekeeper-eix8.onrender.com/
```

#### Frontend Tests
1. Visit https://e-portfolio-2025-lemon.vercel.app
2. Test user registration/login
3. Create, read, update, delete notes
4. Check browser console for errors

### 6. Troubleshooting

#### CORS Issues
- Ensure `CORS_ORIGIN` in backend matches your Vercel URL exactly
- No trailing slashes in URLs
- Check browser network tab for specific CORS errors

#### Database Connection Issues
- Verify `?sslmode=require` is in the connection string
- Check Supabase dashboard for connection limits
- Ensure the password doesn't contain special characters that need encoding

#### SSL Certificate Issues
The backend uses `ssl: { rejectUnauthorized: false }` for Supabase compatibility.

### 7. Rollback Plan

If issues occur:

1. **Quick Rollback**: Update Render's `DATABASE_URL` back to old Render database
2. **Full Rollback**: 
   ```bash
   git checkout main
   # Redeploy both frontend and backend from main branch
   ```

### 8. Post-Migration Checklist

- [ ] Database migrated to Supabase
- [ ] Backend deployed on Render with Supabase connection
- [ ] Frontend deployed on Vercel
- [ ] CORS configured correctly
- [ ] Health checks passing
- [ ] Authentication working
- [ ] CRUD operations on notes working
- [ ] SSL connections verified
- [ ] Performance acceptable
- [ ] Monitoring/logging configured

### 9. Future Enhancements

Consider these Supabase features:
- Row Level Security (RLS) for additional security
- Realtime subscriptions for live updates
- Storage for file attachments
- Edge Functions for serverless operations

## Support

For issues or questions:
1. Check Render logs: Dashboard → Logs
2. Check Vercel logs: Dashboard → Functions → Logs
3. Check Supabase logs: Dashboard → Logs → Database

## Security Notes

- Never commit `.env` files
- Rotate JWT secrets regularly
- Use Supabase's Row Level Security when possible
- Monitor database connections and queries
- Enable 2FA on all service accounts
