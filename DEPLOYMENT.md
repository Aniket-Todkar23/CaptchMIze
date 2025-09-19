# 🚀 Deployment Guide for Captcha API

## Option 1: Vercel (Recommended - FREE & EASY)

### Prerequisites
- GitHub account
- Vercel account (free)

### Steps:

1. **Prepare for deployment**
   ```bash
   # Navigate to your project root
   cd C:\Users\aptod\OneDrive\Desktop\captcha
   ```

2. **Initialize Git repository (if not already done)**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - CAPTCHA API"
   ```

3. **Push to GitHub**
   - Create a new repository on GitHub (name it `captcha-api`)
   - Follow GitHub's instructions to push your code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/captcha-api.git
   git branch -M main
   git push -u origin main
   ```

4. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login with GitHub
   - Click "New Project"
   - Import your `captcha-api` repository
   - Vercel will automatically detect it's a Node.js project
   - Click "Deploy"
   - Done! Your API will be live at `https://your-project-name.vercel.app`

---

## Option 2: Railway (Also FREE)

### Steps:

1. **Sign up at [railway.app](https://railway.app)**

2. **Deploy from GitHub**
   - Connect your GitHub account
   - Select your repository
   - Railway will auto-deploy

3. **Environment Variables**
   - Add `NODE_ENV=production` in Railway dashboard

---

## Option 3: Render (FREE with some limitations)

### Steps:

1. **Sign up at [render.com](https://render.com)**

2. **Create Web Service**
   - Connect GitHub repository
   - Choose "Web Service"
   - Build Command: `npm install`
   - Start Command: `node api-server.js`

---

## Option 4: Heroku (Paid but reliable)

### Prerequisites
- Heroku CLI installed
- Heroku account

### Steps:

1. **Install Heroku CLI**
   ```bash
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Login and create app**
   ```bash
   heroku login
   heroku create your-captcha-api
   ```

3. **Deploy**
   ```bash
   git push heroku main
   ```

---

## 🎯 **QUICK START (Recommended)**

### For Vercel (Fastest way):

1. **Push your code to GitHub:**
   ```bash
   cd C:\Users\aptod\OneDrive\Desktop\captcha
   git init
   git add .
   git commit -m "CAPTCHA API ready for deployment"
   # Create repo on GitHub, then:
   git remote add origin https://github.com/YOUR_USERNAME/captcha-api.git
   git push -u origin main
   ```

2. **Deploy on Vercel:**
   - Visit [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repo
   - Click Deploy
   - Your API is live!

3. **Update frontend:**
   - Replace `localhost:3001` with your Vercel URL
   - Deploy frontend to Vercel too

---

## 📋 **Post-Deployment Checklist**

- [ ] API endpoints working: `/api/health`, `/api/docs`
- [ ] CORS configured for your frontend domain
- [ ] Environment variables set (if any)
- [ ] Database persisting (or switch to cloud DB)
- [ ] Rate limiting working
- [ ] Documentation accessible at `/api/docs`

---

## 🔧 **Configuration Files Included**

- `vercel.json` - Vercel deployment config
- `package.json` - Already configured with proper scripts
- API server already production-ready

---

## 🌐 **Your API Endpoints (After Deployment)**

- **Documentation:** `https://your-domain.vercel.app/api/docs`
- **Health Check:** `https://your-domain.vercel.app/api/health`
- **Register API Key:** `https://your-domain.vercel.app/api/register`
- **Generate CAPTCHA:** `https://your-domain.vercel.app/api/captcha/generate`
- **Verify CAPTCHA:** `https://your-domain.vercel.app/api/captcha/verify`

---

## 🎉 **Next Steps**

1. Deploy your API using Option 1 (Vercel)
2. Update your frontend to use the live API URL
3. Deploy your frontend
4. Share your live CAPTCHA service!

Your CAPTCHA API is production-ready with:
- ✅ Multi-type CAPTCHAs (GIF, Image, Text, Math, Puzzle)
- ✅ API key authentication
- ✅ Rate limiting
- ✅ Professional documentation
- ✅ Error handling
- ✅ CORS support
- ✅ Usage analytics