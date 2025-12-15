# Troubleshooting Guide - White Screen Issue

If you're seeing a white screen, follow these steps:

## Step 1: Install Dependencies

Make sure all dependencies are installed:

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

## Step 2: Check for Errors

Open your browser's Developer Console (F12) and check for any error messages.

## Step 3: Start the Servers

You need to start BOTH the frontend and backend servers:

### Option A: Start Both Together (Recommended)
```bash
# From the root directory
npm run dev
```

### Option B: Start Separately

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

## Step 4: Check URLs

- Frontend should be running at: http://localhost:3000
- Backend should be running at: http://localhost:5000

## Step 5: Common Issues

### Issue: "Cannot find module" errors
**Solution:** Delete `node_modules` and reinstall:
```bash
# In client folder
rm -rf node_modules package-lock.json
npm install

# In server folder
rm -rf node_modules package-lock.json
npm install
```

### Issue: Port already in use
**Solution:** Kill the process using the port or change the port in `vite.config.js`

### Issue: CORS errors
**Solution:** Make sure the backend server is running on port 5000

### Issue: Still seeing white screen
**Solution:** 
1. Check browser console (F12) for JavaScript errors
2. Make sure `client/src/contexts/AuthContext.jsx` exists
3. Make sure all component files are present in `client/src/components/`

## Quick Fix Script

If nothing works, try this:

```bash
# From root directory
npm run install:all
npm run dev
```

Then open http://localhost:3000 in your browser.
