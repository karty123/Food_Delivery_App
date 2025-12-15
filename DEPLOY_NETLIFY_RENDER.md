# 🚀 Deploy to Netlify (Frontend) + Render (Backend)

Step-by-step guide to deploy your Food Delivery app.

---

## 📋 Prerequisites

- GitHub account
- Netlify account (sign up at [netlify.com](https://netlify.com))
- Render account (sign up at [render.com](https://render.com))
- Your code pushed to a GitHub repository

---

## 🔧 Step 1: Deploy Backend to Render

### 1.1 Prepare Your Repository

1. Make sure your code is pushed to GitHub
2. Verify `server/package.json` has a `start` script: `"start": "node server.js"`

### 1.2 Create Web Service on Render

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository (if not connected, authorize Render)
4. Select your repository

### 1.3 Configure the Service

Fill in the form:

- **Name**: `food-delivery-api` (or any name you prefer)
- **Root Directory**: `server` ⚠️ **Important!**
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: Select **Free** (or paid if you want)

### 1.4 Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**, add:

```
NODE_ENV = production
PORT = 5000
ALLOWED_ORIGINS = (leave empty for now, we'll add this after frontend deploys)
```

⚠️ **Note**: We'll update `ALLOWED_ORIGINS` after we get the Netlify URL.

### 1.5 Deploy

1. Click **"Create Web Service"**
2. Wait for deployment (2-5 minutes)
3. Once deployed, copy your service URL (e.g., `https://food-delivery-api.onrender.com`)
4. ⚠️ **Important**: The URL will be your backend API base URL. Add `/api` to all endpoints.

**Your API will be at**: `https://food-delivery-api.onrender.com/api`

### 1.6 Test Your Backend

Open in browser: `https://food-delivery-api.onrender.com/api/restaurants`

You should see JSON data with restaurants.

---

## 🎨 Step 2: Deploy Frontend to Netlify

### 2.1 Connect Repository to Netlify

1. Go to [app.netlify.com](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect to **GitHub** and authorize Netlify
4. Select your repository

### 2.2 Configure Build Settings

Netlify should auto-detect settings from `netlify.toml`, but verify:

- **Base directory**: `client`
- **Build command**: `npm install && npm run build`
- **Publish directory**: `client/dist` (or just `dist`)

If not auto-detected, set manually:
- Click **"Show advanced"**
- Set **Base directory**: `client`
- Set **Build command**: `npm install && npm run build`
- Set **Publish directory**: `dist`

### 2.3 Add Environment Variable

Before deploying, click **"Show advanced"** → **"New variable"**, add:

```
Key: VITE_API_URL
Value: https://food-delivery-api.onrender.com/api
```

⚠️ **Important**: Replace `food-delivery-api.onrender.com` with your actual Render service URL!

### 2.4 Deploy

1. Click **"Deploy site"**
2. Wait for build to complete (2-4 minutes)
3. Once deployed, you'll get a URL like: `https://random-name-12345.netlify.app`
4. Copy this URL

---

## 🔗 Step 3: Connect Frontend and Backend

### 3.1 Update Backend CORS (Render)

1. Go back to Render dashboard
2. Open your web service
3. Go to **"Environment"** tab
4. Update `ALLOWED_ORIGINS`:
   ```
   ALLOWED_ORIGINS=https://your-app-name.netlify.app
   ```
   (Use your actual Netlify URL)

5. Click **"Save Changes"**
6. Render will automatically redeploy

### 3.2 Verify Frontend Environment Variable (Netlify)

1. Go to Netlify dashboard
2. Open your site
3. Go to **Site settings** → **Environment variables**
4. Verify `VITE_API_URL` is set correctly
5. If you need to change it, update and trigger a **"Clear cache and deploy site"**

---

## ✅ Step 4: Test Your Deployed App

1. Open your Netlify URL (e.g., `https://your-app.netlify.app`)
2. Open browser console (F12)
3. Check for any errors

### What to Test:

- ✅ Landing page loads
- ✅ Can browse restaurants
- ✅ Can view menu
- ✅ Can add items to cart
- ✅ Can create account / login
- ✅ Can place order
- ✅ Order tracking works
- ✅ No CORS errors in console

---

## 🐛 Troubleshooting

### CORS Errors

**Symptom**: Console shows CORS error when calling API

**Fix**:
1. Check `ALLOWED_ORIGINS` in Render includes your Netlify URL exactly
2. Make sure no trailing slashes in URLs
3. Redeploy backend after changing environment variables

### API Connection Failed

**Symptom**: Network errors or 404 when calling API

**Fix**:
1. Verify `VITE_API_URL` in Netlify is set correctly
2. Make sure it includes `/api` at the end
3. Test backend URL directly: `https://your-api.onrender.com/api/restaurants`
4. Rebuild frontend after changing environment variables

### Build Fails

**Symptom**: Netlify build fails

**Fix**:
1. Check build logs in Netlify dashboard
2. Verify all dependencies are in `package.json`
3. Try building locally: `cd client && npm install && npm run build`

### Render Service Sleeps (Free Tier)

**Symptom**: First request after inactivity takes 30+ seconds

**Fix**:
- This is normal for Render free tier
- Service spins down after 15 minutes of inactivity
- First request wakes it up (takes time)
- Consider paid tier for production (no sleep)

---

## 📝 Quick Reference

### Backend (Render):
- **Service URL**: `https://your-service.onrender.com`
- **API Base**: `https://your-service.onrender.com/api`
- **Env Vars**: `NODE_ENV`, `PORT`, `ALLOWED_ORIGINS`

### Frontend (Netlify):
- **Site URL**: `https://your-site.netlify.app`
- **Env Var**: `VITE_API_URL=https://your-service.onrender.com/api`

---

## 🎉 Success!

Your app should now be live! Share your Netlify URL with others.

---

## 📚 Next Steps (Optional)

- Add custom domain to Netlify
- Set up database for persistent storage (MongoDB Atlas, PostgreSQL)
- Configure email service for notifications
- Set up monitoring and analytics

