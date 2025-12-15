# 🚀 Deployment Guide

This guide will help you deploy the Food Delivery application to production.

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git account
- Deployment platform accounts (Vercel, Netlify, Railway, Render, etc.)

## 🏗️ Architecture

The application consists of two parts:
1. **Frontend (React/Vite)** - Client application
2. **Backend (Node.js/Express)** - API server

These can be deployed separately or together depending on your platform.

---

## 📦 Option 1: Deploy to Vercel (Frontend) + Railway/Render (Backend)

### Backend Deployment (Railway/Render)

#### Railway:

1. **Sign up/Login** at [railway.app](https://railway.app)
2. **Create a New Project** → "Deploy from GitHub repo"
3. **Select your repository** and choose the `server` folder as root
4. **Add Environment Variables**:
   ```
   PORT=5000
   NODE_ENV=production
   ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
   ```
5. **Deploy** - Railway will automatically detect Node.js and deploy
6. **Copy the deployment URL** (e.g., `https://your-app.up.railway.app`)

#### Render:

1. **Sign up/Login** at [render.com](https://render.com)
2. **New** → **Web Service**
3. **Connect your repository**
4. **Configure**:
   - **Name**: food-delivery-api
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
5. **Add Environment Variables**:
   ```
   PORT=5000
   NODE_ENV=production
   ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
   ```
6. **Deploy** and copy the service URL

### Frontend Deployment (Vercel)

1. **Sign up/Login** at [vercel.com](https://vercel.com)
2. **New Project** → Import your GitHub repository
3. **Configure Project**:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. **Add Environment Variable**:
   ```
   VITE_API_URL=https://your-backend-url.railway.app/api
   ```
   (Replace with your actual backend URL)
5. **Deploy**

---

## 📦 Option 2: Deploy Both to Render

### Backend:

1. Follow the Render backend steps above

### Frontend:

1. **New** → **Static Site**
2. **Configure**:
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
3. **Add Environment Variable**:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com/api
   ```
4. **Deploy**

---

## 📦 Option 3: Deploy to Netlify (Frontend) + Any Backend

### Frontend Deployment (Netlify)

1. **Sign up/Login** at [netlify.com](https://netlify.com)
2. **New site from Git** → Connect repository
3. **Build settings**:
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `client/dist`
4. **Environment Variables** → Add:
   ```
   VITE_API_URL=https://your-backend-url/api
   ```
5. **Deploy**

---

## 🔧 Environment Variables Setup

### Backend (`.env` file or platform environment variables):

```env
PORT=5000
NODE_ENV=production
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

**Important**: Replace `your-frontend-domain.com` with your actual frontend deployment URL.

### Frontend (`.env` file or platform environment variables):

```env
VITE_API_URL=https://your-backend-url/api
```

**Important**: Replace `your-backend-url` with your actual backend deployment URL.

---

## ✅ Post-Deployment Checklist

- [ ] Backend is accessible at the deployed URL
- [ ] Frontend environment variable `VITE_API_URL` points to backend
- [ ] Backend `ALLOWED_ORIGINS` includes frontend URL
- [ ] CORS is working (check browser console for errors)
- [ ] API endpoints are responding correctly
- [ ] Authentication flow works
- [ ] Orders can be placed successfully

---

## 🐛 Troubleshooting

### CORS Errors

If you see CORS errors in the browser console:
1. Check that `ALLOWED_ORIGINS` in backend includes your frontend URL
2. Ensure there are no trailing slashes in the URLs
3. Restart the backend server after changing environment variables

### API Connection Errors

If the frontend can't connect to the backend:
1. Verify `VITE_API_URL` is set correctly
2. Check that the backend URL is accessible (try in browser)
3. Ensure the backend URL includes `/api` at the end
4. Rebuild the frontend after changing environment variables

### Build Errors

If builds fail:
1. Check Node.js version (should be v16+)
2. Ensure all dependencies are in `package.json`
3. Check platform logs for specific error messages

---

## 🔄 Updating After Deployment

### Backend Updates:

1. Push changes to your repository
2. Platform will auto-deploy (if auto-deploy is enabled)
3. Or manually trigger redeploy from platform dashboard

### Frontend Updates:

1. Update code and push to repository
2. If you changed environment variables, update them in platform settings
3. Rebuild and redeploy (usually automatic)

---

## 💾 Database (Future)

Currently, the app uses in-memory storage. For production with data persistence:

1. Set up a database (MongoDB, PostgreSQL, etc.)
2. Update `server/server.js` to use the database
3. Add database connection string to environment variables
4. Migrate data structures to database schemas

---

## 📝 Notes

- The current setup uses in-memory storage, so data resets on server restart
- This is fine for testing/demo deployments
- For production with real users, add a database (as mentioned above)
- Email notifications are currently logged to console - configure SMTP for real emails
- Payment integration is demo-only - integrate real payment gateway for production

---

## 🆘 Need Help?

If you encounter issues:
1. Check the platform's deployment logs
2. Verify all environment variables are set correctly
3. Test the backend API directly using curl or Postman
4. Check browser console for frontend errors

Good luck with your deployment! 🎉

