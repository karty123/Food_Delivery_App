# 🚨 QUICK FIX FOR WHITE SCREEN

## Most Likely Cause: Servers Not Running

### ✅ DO THIS NOW:

1. **Open PowerShell/Terminal** in your project folder:
   ```
   C:\Users\vnska\Desktop\WEB Development Sources\Personal Projects\food Delivery
   ```

2. **Run this ONE command:**
   ```powershell
   npm run dev
   ```

3. **Wait for output** - You should see:
   ```
   [0] VITE ready on http://localhost:3000
   [1] 🚀 Server running on http://localhost:5000
   ```

4. **Open browser** to: http://localhost:3000

---

## ❌ If Command Fails:

### Check 1: Are you in the right folder?
```powershell
pwd
# Should show: ...\food Delivery
```

### Check 2: Are dependencies installed?
```powershell
Test-Path client\node_modules
# Should return: True
```

If False, run:
```powershell
npm run install:all
```

### Check 3: Browser Console Errors
1. Press **F12** in browser
2. Go to **Console** tab
3. Look for **red errors**
4. Common errors:
   - "Cannot find module" → Dependencies not installed
   - "Failed to fetch" → Backend not running
   - "Network error" → Check if port 5000 is available

---

## 🎯 Expected Flow:

```
1. npm run dev
   ↓
2. See two servers starting
   ↓
3. Open http://localhost:3000
   ↓
4. See beautiful landing page! ✨
```

---

## 📞 Still Not Working?

**Check browser console (F12) and share:**
- Any red error messages
- What you see in the Console tab
- Screenshot if possible

The error message will tell us exactly what's wrong!
