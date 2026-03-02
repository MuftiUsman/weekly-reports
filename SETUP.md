# Fabric Integration Setup Guide

## 🎉 What's New

Your Weekly Reports app now integrates with Fabric! You can automatically fetch your timesheet data from Fabric instead of manually copying JSON from Keka.

## ✅ What Was Implemented

### 1. **Backend Proxy Server** (`/server`)
- Express.js server that proxies requests to Fabric API
- Solves CORS issues (no Fabric configuration needed!)
- Transforms Fabric timesheet format to Keka-compatible format
- Runs on `http://localhost:3001`

### 2. **Fabric Authentication UI**
- Connect to Fabric using JWT token (Settings → Fabric Connection)
- Two auth options:
  - **Manual Token**: Paste JWT from Fabric's DevTools
  - **OAuth Redirect**: Opens Fabric login in new window
- Token stored in sessionStorage (secure for internal use)

### 3. **Fetch from Fabric Button**
- Automatically fetches timesheet data for selected date range
- Transforms data to match existing Keka format
- Falls back to manual entry if not connected

### 4. **Configuration**
- `.env` file with Fabric API URL configuration
- Concurrent frontend + backend execution
- TypeScript support for backend

## 🚀 How to Use

### Step 1: Configure Environment

1. Update `/home/mayur/Think41/WeeklyReports/weekly-reports/.env`:
   ```env
   # Update these with your Fabric URLs
   FABRIC_API_URL=https://your-fabric-api.com
   VITE_FABRIC_URL=https://your-fabric-frontend.com
   ```

2. **For local development**, use:
   ```env
   FABRIC_API_URL=http://localhost:8000
   VITE_FABRIC_URL=http://localhost:8000
   ```

### Step 2: Start the Application

```bash
cd /home/mayur/Think41/WeeklyReports/weekly-reports

# Make sure Fabric backend is running first
# (in fabric/server directory: uv run poe dev)

# Then start weekly-reports (frontend + backend)
npm run dev
```

This starts:
- ✅ Frontend on http://localhost:5173
- ✅ Backend on http://localhost:3001

### Step 3: Connect to Fabric

1. Open http://localhost:5173
2. Click the **Settings** icon (⚙️) in top-right
3. Go to **"Fabric Connection"** tab
4. Choose authentication method:

#### **Option A: Manual Token (Recommended)**

1. Log into Fabric at http://localhost:8000
2. Open DevTools (F12) → Network tab
3. Navigate anywhere in Fabric (e.g., timesheets page)
4. Find any API request (e.g., `/api/v1/timesheet`)
5. Copy the **Authorization** header value (the JWT token part, not "Bearer ")
6. Paste token in weekly-reports Settings
7. Click "Connect with Token"

#### **Option B: OAuth Redirect**

1. Click "Open Fabric Login"
2. Log in with Google in the popup window
3. After login, copy your token from Fabric
4. Paste in weekly-reports Settings

### Step 4: Fetch Timesheets

1. Fill in:
   - **Client Name**: e.g., "JPMC"
   - **Employee Name**: Your name
   - **Start Date**: e.g., 2024-03-01
   - **End Date**: e.g., 2024-03-08

2. Click **"Fetch from Fabric"** button

3. ✨ Data automatically loads! Edit and export PDF as usual.

## 📁 Project Structure

```
weekly-reports/
├── server/              # NEW: Backend proxy server
│   ├── src/
│   │   ├── index.ts     # Express server
│   │   └── routes/
│   │       └── timesheet.ts  # Fabric API proxy
│   └── tsconfig.json
├── src/
│   ├── components/
│   │   ├── FabricAuth.tsx     # NEW: Auth component
│   │   └── JsonInput.tsx      # UPDATED: Fetch button
│   ├── services/
│   │   └── fabricApi.ts       # NEW: API client
│   └── types/
│       └── timesheet.ts       # UPDATED: Added token fields
├── .env                # NEW: Configuration
├── package.json        # UPDATED: New scripts
└── README.md           # UPDATED: Instructions
```

## 🔧 Troubleshooting

### Backend not starting?

```bash
# Check if port 3001 is free
lsof -i :3001

# Start backend only
npm run dev:backend
```

### Fabric connection fails?

1. **Check Fabric is running**: `http://localhost:8000`
2. **Check backend is running**: `http://localhost:3001/health`
3. **Verify token**: Token should be a long JWT string (3 parts separated by dots)
4. **Check .env**: Make sure `FABRIC_API_URL` points to correct Fabric backend

### No data returned?

1. **Check date range**: Make sure you have timesheets in Fabric for those dates
2. **Check console**: Open browser DevTools → Console for error messages
3. **Check backend logs**: Look at terminal running `npm run dev`

### CORS errors?

- **Not needed!** The backend proxy bypasses CORS
- If you see CORS errors, backend might not be running

## 🎯 Benefits of This Approach

✅ **No Fabric code changes needed**
✅ **No CORS configuration needed**
✅ **Works with any Fabric deployment**
✅ **Secure for internal use** (short-lived tokens)
✅ **Fallback to manual entry** (if Fabric unavailable)
✅ **Easy to deploy** (single npm start)

## 📝 Notes

- **Token Security**: For internal tools, frontend token storage is acceptable. For production customer-facing apps, consider more robust auth.
- **Token Expiration**: Fabric JWT tokens expire. Just reconnect when they do.
- **Data Format**: Backend automatically transforms Fabric format → Keka format (you don't need to do anything).

## 🚢 Production Deployment

When deploying to production:

1. **Update `.env`** with production URLs:
   ```env
   FABRIC_API_URL=https://fabric-prod.yourcompany.com
   VITE_FABRIC_URL=https://fabric-prod.yourcompany.com
   VITE_BACKEND_URL=https://weekly-reports-backend.yourcompany.com
   FRONTEND_URL=https://weekly-reports.yourcompany.com
   BACKEND_PORT=3001
   ```

2. **Deploy backend**:
   ```bash
   npm run build:backend
   npm run start:backend
   ```

3. **Deploy frontend**:
   ```bash
   npm run build
   # Deploy dist/ folder to your hosting
   ```

4. **Or use Docker** (both together):
   - Backend on port 3001
   - Frontend served via nginx/similar

## 🙋 Questions?

- Backend code: `/server/src/`
- Frontend integration: `/src/components/FabricAuth.tsx` and `/src/components/JsonInput.tsx`
- API transformation: `/server/src/routes/timesheet.ts` (Fabric → Keka format)

Happy automating! 🎊
