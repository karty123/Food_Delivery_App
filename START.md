# 🚀 Quick Start Guide

## If you're seeing a white screen, follow these steps:

### Step 1: Open Terminal in Project Root
Navigate to: `C:\Users\vnska\Desktop\WEB Development Sources\Personal Projects\food Delivery`

### Step 2: Install All Dependencies
```bash
npm run install:all
```

If that doesn't work, install manually:
```bash
npm install
cd client
npm install
cd ../server
npm install
cd ..
```

### Step 3: Start Both Servers
```bash
npm run dev
```

This will start:
- ✅ Frontend on http://localhost:3000
- ✅ Backend on http://localhost:5000

### Step 4: Open Browser
Go to: **http://localhost:3000**

---

## ⚠️ Still White Screen?

### Check Browser Console (F12)
Look for any red error messages and share them.

### Common Fixes:

1. **Clear browser cache**: Ctrl+Shift+R (hard refresh)

2. **Check if servers are running**:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000/api/menu

3. **Reinstall dependencies**:
   ```bash
   cd client
   rm -rf node_modules
   npm install
   ```

4. **Check for missing files**:
   - Make sure `client/src/contexts/AuthContext.jsx` exists
   - Make sure all components exist in `client/src/components/`

---

## 📋 What Should Happen

1. ✅ Landing page with beautiful hero section
2. ✅ "Order Now" button to go to menu
3. ✅ Menu with food items
4. ✅ Working cart
5. ✅ Checkout process

If any step fails, check the browser console (F12) for errors!
