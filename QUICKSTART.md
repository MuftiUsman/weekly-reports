# 🚀 Quick Start Guide - Fabric Integration

## Ready to Go!

Your weekly-reports app is now configured to fetch data from:
**https://fabric-dev.think41.ai**

## Step-by-Step Usage

### 1️⃣ Start the Application

```bash
cd /home/mayur/Think41/WeeklyReports/weekly-reports
npm run dev
```

You should see:
```
✅ Backend server running on http://localhost:3001
📡 Proxying to Fabric API at: https://fabric-dev.think41.ai
🌐 Accepting requests from: http://localhost:5173

VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

### 2️⃣ Get Your Fabric Token

1. Open **https://fabric-dev.think41.ai** in your browser
2. Log in with your Google account
3. Press **F12** to open DevTools
4. Go to **Network** tab
5. Navigate to any page in Fabric (e.g., timesheets)
6. Find any API request (look for `/api/v1/...`)
7. Click on it → **Headers** tab
8. Find **Authorization: Bearer eyJhbGc...**
9. **Copy the token** (the long string after "Bearer ", not including "Bearer ")

### 3️⃣ Connect to Fabric in Weekly Reports

1. Open **http://localhost:5173**
2. Click the **Settings** icon (⚙️) in the top-right
3. Go to **"Fabric Connection"** tab
4. Paste your token in the input field
5. Click **"Connect with Token"**
6. You should see: ✅ **"Connected to Fabric"** with your email

### 4️⃣ Fetch Your Timesheets

1. Fill in the form:
   - **Client Name**: e.g., "JPMC" or "Internal"
   - **Employee Name**: Your name
   - **Start Date**: e.g., 2024-03-01
   - **End Date**: e.g., 2024-03-07

2. Click the **"Fetch from Fabric"** button (with cloud icon ☁️)

3. ✨ Your timesheets load automatically!

4. Edit summaries/locations as needed

5. Generate executive summary with AI (optional)

6. Export to PDF 📄

## 🎥 Visual Flow

```
┌─────────────────────────────────────────────────┐
│  Weekly Reports (http://localhost:5173)         │
│  ┌───────────────────────────────────────────┐  │
│  │ Settings ⚙️                                │  │
│  │  └─ Fabric Connection                     │  │
│  │     └─ [Paste Token] → Connected ✅       │  │
│  └───────────────────────────────────────────┘  │
│                                                  │
│  ┌───────────────────────────────────────────┐  │
│  │ Client: JPMC                              │  │
│  │ Employee: John Doe                        │  │
│  │ Dates: 2024-03-01 to 2024-03-07          │  │
│  │                                            │  │
│  │ [☁️ Fetch from Fabric]                    │  │
│  └───────────────────────────────────────────┘  │
│                     ↓                            │
│              Fetching data...                    │
│                     ↓                            │
│  ┌───────────────────────────────────────────┐  │
│  │ ✅ Data Loaded!                           │  │
│  │ Mon Mar 1: Design mockups (8h)            │  │
│  │ Tue Mar 2: API development (7h)           │  │
│  │ ...                                        │  │
│  │ [Export PDF] [Generate Summary]           │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
              ↕️ API Calls
┌─────────────────────────────────────────────────┐
│  Backend Proxy (http://localhost:3001)          │
│  - Receives: Token + Date Range                 │
│  - Calls: https://fabric-dev.think41.ai         │
│  - Transforms: Fabric → Keka format             │
│  - Returns: Ready-to-use data                   │
└─────────────────────────────────────────────────┘
              ↕️ API Calls
┌─────────────────────────────────────────────────┐
│  Fabric (https://fabric-dev.think41.ai)         │
│  - Authenticates: JWT token                     │
│  - Returns: Your timesheet entries              │
└─────────────────────────────────────────────────┘
```

## ⚡ Pro Tips

1. **Token stays active**: Once connected, you can fetch multiple date ranges without reconnecting

2. **Token expires**: If you get auth errors, just reconnect with a fresh token

3. **Check backend health**: Visit http://localhost:3001/health to verify backend is running

4. **Manual entry still works**: If Fabric is down, you can still use manual entry mode

5. **Console logs**: Open browser console (F12 → Console) to see detailed fetch logs

## 🐛 Troubleshooting

### "Please connect to Fabric in Settings first"
→ Get token from Fabric and paste in Settings → Fabric Connection

### "Failed to fetch timesheets: 401"
→ Token expired. Get a fresh token from Fabric

### "No timesheet data found for the selected date range"
→ Check if you have timesheets in Fabric for those dates

### Backend not starting / Port 3001 in use
```bash
# Kill process on port 3001
lsof -i :3001
kill -9 <PID>

# Or change port in .env
BACKEND_PORT=3002
```

### CORS errors
→ Shouldn't happen! Backend proxy handles CORS. Make sure backend is running.

## 🎉 You're All Set!

No more copying JSON from Keka! Just:
1. Connect to Fabric once
2. Select dates
3. Click Fetch
4. Done! ✨

---

**Need help?** Check `SETUP.md` for detailed documentation.
