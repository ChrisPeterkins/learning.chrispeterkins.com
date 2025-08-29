# Complete Guide: Setting Up learning.chrispeterkins.com

## Overview
This guide explains how to deploy a GitHub repository to the subdomain learning.chrispeterkins.com

## Prerequisites
- [x] VPS with Ubuntu 24.04
- [x] Nginx installed
- [x] PM2 installed
- [x] Node.js installed
- [ ] GitHub repository with your code
- [ ] DNS A record pointing to your server IP

## Step-by-Step Setup

### 1. DNS Configuration
Add an A record in your DNS provider:
- Name: `learning`
- Type: `A`
- Value: Your server's IP address
- TTL: 3600

Wait 5-30 minutes for DNS propagation.

### 2. Initial GitHub Clone
```bash
cd /var/www/learning.chrispeterkins.com
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git .
```

### 3. Configure Your Application

#### For Next.js Static Export:
1. Ensure `next.config.js` has `output: 'export'`
2. Copy this static server file:
```javascript
// serve-static.js
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3002;
const PUBLIC_DIR = path.join(__dirname, 'out');

// ... (full code in the actual file)
```

#### For Next.js Dynamic App:
1. Update `package.json`:
```json
"scripts": {
  "start": "next start -p 3002"
}
```

#### For Regular Node.js App:
Just ensure your app listens on port 3002.

### 4. Install Dependencies and Build
```bash
npm install
npm run build  # if needed
```

### 5. Start with PM2
```bash
# Using ecosystem file (recommended):
pm2 start ecosystem.config.js

# Or directly:
pm2 start serve-static.js --name "learning.chrispeterkins.com"

# Save PM2 configuration:
pm2 save
```

### 6. Test Your Site
```bash
# Test locally:
curl http://localhost:3002

# Test through nginx (after DNS propagation):
curl http://learning.chrispeterkins.com
```

## Deployment Workflow

### Manual Deployment
Run the deployment script:
```bash
cd /var/www/learning.chrispeterkins.com
./deploy.sh
```

### Automatic Deployment with GitHub Webhooks

1. **Generate a secret token:**
```bash
openssl rand -hex 32
```

2. **Create webhook endpoint** (webhook.js):
```javascript
const crypto = require('crypto');
const exec = require('child_process').exec;
const express = require('express');
const app = express();

const SECRET = 'your-webhook-secret';

app.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
  const signature = req.headers['x-hub-signature-256'];
  const hash = 'sha256=' + crypto.createHmac('sha256', SECRET)
    .update(req.body)
    .digest('hex');
  
  if (signature === hash) {
    exec('./deploy.sh', (error, stdout, stderr) => {
      console.log(stdout);
      if (error) console.error(error);
    });
    res.status(200).send('Deployment started');
  } else {
    res.status(401).send('Unauthorized');
  }
});

app.listen(3003);
```

3. **Configure GitHub Webhook:**
   - Go to your repository → Settings → Webhooks
   - Add webhook URL: `http://your-server-ip:3003/webhook`
   - Content type: `application/json`
   - Secret: Your generated token
   - Events: Just push events

## SSL Certificate Setup (HTTPS)

### Using Certbot (Let's Encrypt):
```bash
# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d learning.chrispeterkins.com

# Auto-renewal is configured automatically
```

After SSL setup, nginx will automatically update to use HTTPS.

## Monitoring

### Check application status:
```bash
pm2 status
pm2 logs learning.chrispeterkins.com
```

### Check nginx logs:
```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## Troubleshooting

### Site not accessible:
1. Check DNS propagation: `nslookup learning.chrispeterkins.com`
2. Check nginx: `sudo nginx -t && sudo systemctl reload nginx`
3. Check PM2: `pm2 status`
4. Check firewall: `sudo ufw status`

### Application crashes:
1. Check logs: `pm2 logs learning.chrispeterkins.com`
2. Check port conflicts: `ss -tlnp | grep 3002`
3. Restart: `pm2 restart learning.chrispeterkins.com`

### Deployment fails:
1. Check permissions: `ls -la /var/www/learning.chrispeterkins.com`
2. Check Git: `git status`
3. Manual pull: `git pull origin main`

## Multiple Subdomains

To add more subdomains (e.g., api.chrispeterkins.com):
1. Create directory: `/var/www/api.chrispeterkins.com`
2. Copy and modify nginx config
3. Use different port (e.g., 3003)
4. Repeat the setup process

## Security Best Practices

1. **Use environment variables** for secrets:
```bash
# Create .env file (don't commit to Git!)
echo "API_KEY=your-secret-key" > .env

# Load in your app
require('dotenv').config();
```

2. **Set up firewall:**
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

3. **Keep dependencies updated:**
```bash
npm audit
npm update
```

## Quick Reference

| Task | Command |
|------|---------|
| Deploy latest code | `./deploy.sh` |
| View logs | `pm2 logs learning.chrispeterkins.com` |
| Restart app | `pm2 restart learning.chrispeterkins.com` |
| Check status | `pm2 status` |
| Test locally | `curl http://localhost:3002` |
| Reload nginx | `sudo systemctl reload nginx` |

## Contact
For issues or questions about this setup, check the server logs or PM2 status first.