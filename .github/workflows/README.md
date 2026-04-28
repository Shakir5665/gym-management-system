# GitHub Workflows - Keep Server Alive

This directory contains GitHub Actions workflows to keep your server alive and monitor its health.

## 📋 Workflows Included

### 1. **keep-alive.yml** - Basic Keep-Alive Pings

- **Schedule**: Every 10 minutes
- **Purpose**: Prevents server from going to sleep on free-tier hosting (Render, Heroku)
- **Action**: Makes HTTP requests to your server health endpoint

### 2. **deploy.yml** - Health & Deployment Checks

- **Schedule**:
  - Daily at 2 AM UTC
  - On every push to `main` or `develop` branch
- **Purpose**: Comprehensive server health checks and code validation
- **Includes**:
  - Node.js and dependency validation
  - Environment variable checks
  - Code structure validation
  - Server connectivity tests

### 3. **monitor.yml** - Continuous Monitoring

- **Schedule**: Every 5 minutes
- **Purpose**: Intensive monitoring with detailed metrics
- **Tests**:
  - Basic connectivity
  - Response time measurement
  - Database connectivity check
  - Performance metrics logging

## 🚀 Setup Instructions

### Step 1: Push Code to GitHub

```bash
cd c:\Users\shaki\Desktop\gym-system
git init
git add .
git commit -m "Initial commit with GitHub workflows"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/gym-system.git
git push -u origin main
```

### Step 2: Configure GitHub Secrets

1. Go to: **GitHub Repository → Settings → Secrets and variables → Actions**
2. Click **"New repository secret"**
3. Add the following secrets:

#### Required Secrets:

| Secret Name  | Value                     | Example                        |
| ------------ | ------------------------- | ------------------------------ |
| `SERVER_URL` | Your deployed server URL  | `https://gym-api.onrender.com` |
| `MONGO_URI`  | MongoDB connection string | `mongodb+srv://user:pass@...`  |
| `JWT_SECRET` | Your JWT secret key       | `your-secret-key-here`         |

### Step 3: Verify Workflows

1. Go to **GitHub Repository → Actions**
2. You should see three workflows:
   - ✅ Keep Server Alive
   - ✅ Server Health & Deployment
   - ✅ Continuous Monitoring
3. Click on each to verify they're enabled

## 📊 Monitoring Dashboard

### View Workflow Status:

```
GitHub → Actions → [Select Workflow] → Recent runs
```

### Check Logs:

1. Click on a workflow run
2. Click on the job (e.g., "ping-server")
3. Expand any step to see detailed logs

## 🔧 Customization

### Change Keep-Alive Frequency

**File**: `.github/workflows/keep-alive.yml`

Change the cron schedule:

```yaml
- cron: "*/10 * * * *" # Every 10 minutes
# OR
- cron: "*/15 * * * *" # Every 15 minutes
# OR
- cron: "0 * * * *" # Every hour
```

### Cron Schedule Format

```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of week (0 - 6)
│ │ │ │ │
│ │ │ │ │
* * * * *
```

**Common Schedules**:

- `*/5 * * * *` - Every 5 minutes
- `*/15 * * * *` - Every 15 minutes
- `0 * * * *` - Every hour
- `0 2 * * *` - Every day at 2 AM UTC
- `0 9 * * 1` - Every Monday at 9 AM UTC

## 🌍 Deployment Platforms Support

### Render.com

- Free tier: Server sleeps after 15 min of inactivity
- **Solution**: Set keep-alive to `*/10 * * * *` (every 10 minutes)

### Heroku

- Free dynos: Sleeps after 30 min of inactivity
- **Solution**: Set keep-alive to `*/20 * * * *` (every 20 minutes)

### Railway / Vercel

- Provides better uptime guarantees
- **Solution**: `*/30 * * * *` (every 30 minutes) for monitoring

### Self-hosted / AWS / Google Cloud

- Always on (typically)
- **Solution**: Keep `monitor.yml` for health checks

## 📝 Example SERVER_URL Values

```bash
# Render.com
https://gym-api.onrender.com

# Heroku
https://gym-system-api.herokuapp.com

# Railway
https://gym-api-railway.up.railway.app

# AWS EC2 / Self-hosted
https://your-domain.com:5000

# Local (for testing)
http://localhost:5000
```

## ❌ Troubleshooting

### Workflow Not Running

1. Check if workflows are enabled: **Settings → Actions → General → Allow all actions**
2. Verify workflow syntax: Use [cron-job.org](https://crontab.guru/) to validate schedule
3. Ensure `.github/workflows/*.yml` files are in the `main` branch

### Server URL Secret Not Working

1. **Verify secret exists**: Settings → Secrets and variables → Actions
2. **Check exact secret name**: Should be exactly `SERVER_URL` (case-sensitive)
3. **Re-save if changed**: Delete and recreate the secret

### Server Still Going to Sleep

1. Reduce cron interval: Change from `*/15` to `*/10` or `*/5`
2. Add a scheduled job: Combine keep-alive + monitoring workflows
3. Upgrade hosting plan: Move to paid tier if available

### "Unauthorized" Responses (HTTP 401/403)

- This is **OK!** Means server is up but requires authentication
- The workflow correctly identifies this as "server is alive"

## 📊 Monitoring Tips

1. **Set up GitHub Status Checks**:
   - Go to **Settings → Branches → Branch Protection Rules**
   - Require workflow checks to pass before merging

2. **View Workflow Statistics**:
   - **Actions → Workflows → Select Workflow → Insights**
   - See success/failure trends over time

3. **Get Notifications**:
   - Go to **Settings → Notifications**
   - Enable "Actions" notifications
   - Set to "Notify on failure" for workflows

## 🔒 Security Best Practices

1. ✅ Never hardcode secrets in workflow files
2. ✅ Use GitHub Secrets for sensitive data
3. ✅ Restrict secret access to required workflows
4. ✅ Regularly rotate JWT_SECRET and other credentials
5. ✅ Review workflow permissions: **Settings → Actions → General → Workflow permissions**

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Cron Expression Generator](https://crontab.guru/)
- [Render Sleep/Wake Docs](https://docs.render.com/deploys)
- [Heroku Dyno Sleep](https://devcenter.heroku.com/articles/dyno-types#free-dyno-hours)

## 🆘 Still Need Help?

1. Check workflow logs: **Actions → Workflow → Latest run → See logs**
2. Verify all secrets are set correctly
3. Test SERVER_URL manually: `curl https://your-server-url`
4. Check server logs on your hosting platform
5. Ensure MongoDB connection is working

---

**Last Updated**: April 28, 2026
**Workflows Created**: 3 (keep-alive, deploy, monitor)
