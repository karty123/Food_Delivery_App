# ⚠️ WHITE SCREEN FIX - Read This First!

## The Problem
White screen = Dependencies not installed OR servers not running

## ✅ SOLUTION - Follow These Steps:

### Step 1: Open PowerShell/Terminal
Navigate to your project folder:
```
C:\Users\vnska\Desktop\WEB Development Sources\Personal Projects\food Delivery
```

### Step 2: Install Dependencies (REQUIRED!)

Run this command:
```powershell
npm run install:all
```

**This installs:**
- Root dependencies
- Client (React) dependencies  
- Server (Node.js) dependencies

**⚠️ IMPORTANT:** Wait for this to complete (takes 1-2 minutes)

### Step 3: Start the Application

Run this command:
```powershell
npm run dev
```

You should see:
```
[0] > food-delivery-client@0.1.0 dev
[0] > vite
[0] 
[0]   VITE v5.0.8  ready in 500 ms
[0] 
[0]   ➜  Local:   http://localhost:3000/
[1] 🚀 Server running on http://localhost:5000
```

### Step 4: Open Browser
Go to: **http://localhost:3000**

---

## 🔧 If It Still Doesn't Work:

### Option A: Manual Installation
```powershell
# 1. Install root
npm install

# 2. Install client (new terminal)
cd client
npm install
cd ..

# 3. Install server (new terminal)
cd server
npm install
cd ..

# 4. Start both servers
npm run dev
```

### Option B: Check for Errors
1. Open browser console: Press **F12**
2. Look for **red error messages**
3. Check the **Console** tab
4. Share the error message

### Option C: Verify Files Exist
Make sure these files exist:
- ✅ `client/src/App.jsx`
- ✅ `client/src/main.jsx`
- ✅ `client/src/contexts/AuthContext.jsx`
- ✅ `client/src/components/Header.jsx`
- ✅ `server/server.js`

---

## 🎯 Expected Result
After running `npm run dev`, you should see:
- Beautiful landing page with purple/pink gradient
- "FoodDeliver" header
- "Order Now" button
- Modern UI with animations

---

## 💡 Quick Commands Summary

```powershell
# Install everything
npm run install:all

# Start both servers
npm run dev

# Or start separately:
# Terminal 1:
cd client
npm run dev

# Terminal 2:
cd server  
npm run dev
```

**Still stuck?** Check the browser console (F12) for errors and share them!
