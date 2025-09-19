# 🗄️ Database Setup for Cloud Deployment

## 🚨 **Important: SQLite won't work in serverless deployments!**

Your current `database.js` uses SQLite, which works locally but **will not persist data** in cloud deployments like Vercel, Railway, or Render. You need a cloud database.

---

## 🌟 **Recommended: Option 1 - Neon (PostgreSQL) - FREE**

### Why Neon?
- ✅ **FREE** tier with generous limits
- ✅ **PostgreSQL** compatible
- ✅ **Serverless** - perfect for Vercel
- ✅ **Easy setup** - 2-minute configuration

### Setup Steps:

1. **Sign up at [neon.tech](https://neon.tech)**
   - Create account (free)
   - Create a new project
   - Choose region closest to you

2. **Get your connection string:**
   - Copy the connection string (looks like: `postgresql://username:password@host/database?sslmode=require`)

3. **Update your backend:**
   ```bash
   # Install PostgreSQL driver
   npm install pg
   ```

4. **Switch to PostgreSQL database:**
   - Rename `database.js` to `database-sqlite.js` (backup)
   - Rename `database-postgres.js` to `database.js`

5. **Set environment variable:**
   - In Vercel: Dashboard → Your Project → Settings → Environment Variables
   - Add: `DATABASE_URL` = your Neon connection string

---

## 🔧 **Option 2 - Supabase (Also FREE)**

### Setup Steps:

1. **Sign up at [supabase.com](https://supabase.com)**
2. **Create new project**
3. **Get connection string from Settings → Database**
4. **Follow same steps as Neon above**

---

## ⚡ **Option 3 - Railway PostgreSQL**

### Setup Steps:

1. **In Railway dashboard**
2. **Add PostgreSQL service**
3. **Copy DATABASE_URL from variables**
4. **Use same PostgreSQL setup as above**

---

## 🛠️ **Quick Migration Script**

I've created `database-postgres.js` for you. To migrate:

### Step 1: Install PostgreSQL driver
```bash
cd backend
npm install pg
```

### Step 2: Backup current database
```bash
# Rename current file
mv database.js database-sqlite.js
mv database-postgres.js database.js
```

### Step 3: Update package.json
```json
{
  "dependencies": {
    "pg": "^8.11.3",
    "sqlite3": "^5.1.6"
  }
}
```

---

## 🎯 **Recommended Deployment Flow**

### 1. **Set up Neon Database** (2 minutes)
- Go to [neon.tech](https://neon.tech)
- Create account → New project
- Copy connection string

### 2. **Update your code** (1 minute)
```bash
# In backend folder
npm install pg
mv database.js database-sqlite.js
mv database-postgres.js database.js
```

### 3. **Deploy with database** (2 minutes)
- Push to GitHub
- Deploy on Vercel
- Add `DATABASE_URL` environment variable in Vercel
- Done!

---

## 📊 **Database Comparison**

| Service | Price | Setup Time | Best For |
|---------|-------|------------|----------|
| **Neon** | FREE | 2 min | Serverless apps |
| **Supabase** | FREE | 3 min | Full-stack apps |
| **Railway** | FREE | 1 min | Simple deployment |
| **PlanetScale** | FREE | 5 min | MySQL preferred |

---

## 🔄 **Migration Commands**

### Quick setup for Neon:
```bash
# 1. Install PostgreSQL
cd C:\Users\aptod\OneDrive\Desktop\captcha\backend
npm install pg

# 2. Switch database files
mv database.js database-sqlite.js
mv database-postgres.js database.js

# 3. Commit changes
git add .
git commit -m "Switch to PostgreSQL for cloud deployment"
git push
```

### Environment variables needed:
- `DATABASE_URL` - Your Neon/Supabase connection string
- `NODE_ENV` - Set to "production"

---

## ✅ **Post-Migration Checklist**

- [ ] Cloud database created (Neon recommended)
- [ ] `pg` package installed
- [ ] `database.js` updated to PostgreSQL version
- [ ] `DATABASE_URL` environment variable set
- [ ] Code pushed to GitHub
- [ ] Deployed and tested

---

## 🚀 **Ready to Deploy?**

1. **Choose Neon (recommended)**
2. **Follow the migration steps above**
3. **Deploy normally**
4. **Your database will persist across deployments!**

Your API will work exactly the same, but now with a proper cloud database that persists data! 🎉