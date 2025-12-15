# ✅ Deployment Checklist

Use this checklist to ensure everything is configured correctly before deploying.

## 📦 Pre-Deployment

- [ ] Code is pushed to GitHub repository
- [ ] `netlify.toml` exists in root directory
- [ ] `render.yaml` exists in root directory (optional, helpful)
- [ ] `.env` files are in `.gitignore` (✅ already done)
- [ ] All dependencies are listed in `package.json` files

## 🔧 Backend Deployment (Render)

- [ ] Created Render account and logged in
- [ ] Created new Web Service
- [ ] Set Root Directory to `server`
- [ ] Set Build Command to `npm install`
- [ ] Set Start Command to `npm start`
- [ ] Added environment variable: `NODE_ENV=production`
- [ ] Added environment variable: `PORT=5000`
- [ ] Deployed and got service URL
- [ ] Tested backend URL: `https://your-service.onrender.com/api/restaurants`
- [ ] Backend returns JSON data (no errors)

## 🎨 Frontend Deployment (Netlify)

- [ ] Created Netlify account and logged in
- [ ] Connected GitHub repository
- [ ] Set Base directory to `client`
- [ ] Set Build command to `npm install && npm run build`
- [ ] Set Publish directory to `dist`
- [ ] Added environment variable: `VITE_API_URL=https://your-backend.onrender.com/api`
- [ ] Deployed and got site URL
- [ ] Site loads without errors

## 🔗 Connect Frontend & Backend

- [ ] Updated Render `ALLOWED_ORIGINS` with Netlify URL
- [ ] Render service redeployed after env var change
- [ ] Verified Netlify `VITE_API_URL` points to correct backend
- [ ] Tested frontend → backend connection (no CORS errors)

## ✅ Post-Deployment Testing

- [ ] Landing page loads correctly
- [ ] Can navigate to restaurants page
- [ ] Can view restaurant menu
- [ ] Can add items to cart
- [ ] Cart displays correctly
- [ ] Can create user account
- [ ] Can log in
- [ ] Can place an order
- [ ] Order tracking page works
- [ ] Order history loads (if logged in)
- [ ] No console errors in browser
- [ ] No CORS errors

## 🎉 Success Criteria

✅ All items checked = Your app is successfully deployed!

---

## 📝 Important URLs to Save

**Backend API**: `https://_______________.onrender.com/api`  
**Frontend**: `https://_______________.netlify.app`

**Backend Environment Variables:**
- `NODE_ENV=production`
- `PORT=5000`
- `ALLOWED_ORIGINS=https://_______________.netlify.app`

**Frontend Environment Variable:**
- `VITE_API_URL=https://_______________.onrender.com/api`

---

## 🆘 If Something Fails

1. Check deployment logs in Netlify/Render dashboards
2. Verify all environment variables are set correctly
3. Test backend URL directly in browser
4. Check browser console for errors
5. Review `DEPLOY_NETLIFY_RENDER.md` troubleshooting section

