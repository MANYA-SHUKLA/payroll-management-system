# Deployment Guide for Render

## Current Setup

- **Backend URL**: `https://payroll-management-system-s3ze.onrender.com/`
- **Frontend**: Needs to be deployed separately

## Step 1: Deploy Frontend Service

### Option A: Using Blueprint (Recommended)

1. Go to Render Dashboard → "New" → "Blueprint"
2. Connect your GitHub repository: `https://github.com/MANYA-SHUKLA/payroll-management-system`
3. Render will detect `render.yaml` and create both services
4. **Skip the backend service** (you already have it) or delete it after creation
5. Keep only the frontend service

### Option B: Manual Frontend Deployment

1. Go to Render Dashboard → "New" → "Web Service"
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `payroll-frontend` (or any name you prefer)
   - **Root Directory**: `client`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free

4. **Environment Variables** (Important!):
   ```
   NODE_ENV=production
   PORT=3000
   NEXT_PUBLIC_API_URL=https://payroll-management-system-s3ze.onrender.com/api
   ```

5. Click "Create Web Service"

## Step 2: Update Backend CORS

After your frontend is deployed, you'll get a URL like:
`https://payroll-frontend-xxxx.onrender.com`

1. Go to your **Backend Service** on Render
2. Navigate to "Environment" tab
3. Add/Update the `ALLOWED_ORIGINS` variable:
   ```
   ALLOWED_ORIGINS=https://payroll-frontend-xxxx.onrender.com,http://localhost:3000
   ```
   (Replace `payroll-frontend-xxxx` with your actual frontend service name)

4. **Redeploy** the backend service

## Step 3: Verify Deployment

1. **Backend Health Check**:
   Visit: `https://payroll-management-system-s3ze.onrender.com/api/health`
   Should show: `{"status":"OK","message":"Server is running"}`

2. **Frontend**:
   Visit your frontend URL
   Should show the login page or redirect properly

## Environment Variables Checklist

### Backend Service (`payroll-management-system-s3ze`)
- ✅ `MONGODB_URI` - Your MongoDB Atlas connection string
- ✅ `JWT_SECRET` - A strong secret key
- ✅ `JWT_EXPIRE` - `7d`
- ✅ `EMAIL_USER` - Your Gmail address
- ✅ `EMAIL_PASS` - Your Gmail app password
- ✅ `ALLOWED_ORIGINS` - Your frontend URL(s)

### Frontend Service
- ✅ `NODE_ENV` - `production`
- ✅ `PORT` - `3000`
- ✅ `NEXT_PUBLIC_API_URL` - `https://payroll-management-system-s3ze.onrender.com/api`

## Troubleshooting

### "Cannot GET /" on Backend
- This is normal! The backend is an API, not a web page
- Visit `/api/health` to verify it's working

### CORS Errors
- Make sure `ALLOWED_ORIGINS` in backend includes your frontend URL
- No trailing slashes in URLs
- Redeploy backend after updating CORS

### API Not Working
- Check `NEXT_PUBLIC_API_URL` is set correctly in frontend
- Verify backend is running (check `/api/health`)
- Check browser console for errors

