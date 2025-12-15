# 🚀 Quick Deployment Guide

## Pre-Deployment Checklist ✅

Your app is now ready for deployment! Here's what was prepared:

- ✅ **Centralized API Configuration** - All components use `client/src/config/api.js`
- ✅ **Environment Variable Support** - Uses `VITE_API_URL` for frontend
- ✅ **Production CORS Setup** - Backend accepts configurable allowed origins
- ✅ **Deployment Documentation** - See `DEPLOYMENT.md` for detailed steps

## 🎯 Quick Start Deployment

### 1. Deploy Backend First

**Choose a platform:**
- **Railway**: [railway.app](https://railway.app) - Easy, free tier available
- **Render**: [render.com](https://render.com) - Free tier, slower cold starts
- **Fly.io**: [fly.io](https://fly.io) - Great performance

**Steps:**
1. Connect your GitHub repo
2. Set root directory to `server/`
3. Add environment variables:
   ```
   PORT=5000
   NODE_ENV=production
   ALLOWED_ORIGINS=https://your-frontend-url.com
   ```
4. Deploy and copy the URL

### 2. Deploy Frontend

**Choose a platform:**
- **Vercel**: [vercel.com](https://vercel.com) - Recommended, excellent for React
- **Netlify**: [netlify.com](https://netlify.com) - Great alternative

**Steps:**
1. Connect your GitHub repo
2. Set root directory to `client/`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variable:
   ```
   VITE_API_URL=https://your-backend-url/api
   ```
6. Deploy

## 📝 Environment Variables Reference

### Backend (`.env` or platform settings):
```env
PORT=5000
NODE_ENV=production
ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
```

### Frontend (platform settings):
```env
VITE_API_URL=https://your-backend-url.railway.app/api
```

## ⚠️ Important Notes

1. **Set `ALLOWED_ORIGINS`** to match your frontend URL exactly
2. **Set `VITE_API_URL`** to your backend URL + `/api`
3. **Rebuild frontend** after setting environment variables
4. **Test CORS** - Check browser console for any CORS errors

## 🔍 Testing After Deployment

1. Open your frontend URL
2. Check browser console for errors
3. Try logging in/registering
4. Add items to cart
5. Complete checkout
6. Verify order tracking works

## 📚 More Details

- Full deployment guide: See `DEPLOYMENT.md`
- Environment setup: See `ENV_SETUP.md`

## 🆘 Troubleshooting

**CORS Errors?**
→ Check `ALLOWED_ORIGINS` includes your frontend URL

**API Connection Failed?**
→ Verify `VITE_API_URL` is set correctly and includes `/api`

**Build Fails?**
→ Check platform logs for specific errors

---

Good luck! 🎉

