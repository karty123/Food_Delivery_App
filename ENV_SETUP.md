# Environment Variables Setup

## Backend Environment Variables

Create a `.env` file in the `server/` directory:

```env
PORT=5000
NODE_ENV=production
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

**Important**: 
- Replace `your-frontend-domain.com` with your actual frontend deployment URL
- Multiple origins can be comma-separated: `https://app.com,https://www.app.com`
- In development, localhost ports are allowed by default

## Frontend Environment Variables

Create a `.env` file in the `client/` directory:

```env
VITE_API_URL=https://your-backend-url/api
```

**Important**:
- Replace `your-backend-url` with your actual backend deployment URL
- Must include `/api` at the end
- Leave empty for development (defaults to `http://localhost:5000/api`)

## Platform-Specific Setup

### Vercel (Frontend):
Add environment variables in Project Settings → Environment Variables

### Netlify (Frontend):
Add environment variables in Site Settings → Build & Deploy → Environment

### Railway (Backend):
Add environment variables in Project → Variables tab

### Render (Backend):
Add environment variables in Service → Environment tab

## Notes

- After changing environment variables, you may need to rebuild/redeploy
- Frontend build-time variables (VITE_*) must be set before building
- Never commit `.env` files to git (they should be in `.gitignore`)

