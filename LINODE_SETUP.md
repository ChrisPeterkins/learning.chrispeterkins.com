# Linode-Specific Setup for learning.chrispeterkins.com

## DNS Configuration in Linode

### Via Linode Cloud Manager:
1. Go to https://cloud.linode.com
2. Click **Domains** → **chrispeterkins.com**
3. Click **Add an A/AAAA Record**
4. Enter:
   - Hostname: `learning`
   - IP Address: `172.104.26.244`
   - TTL: Default
5. Click **Save**

### Via Linode CLI (if installed):
```bash
linode-cli domains records-create chrispeterkins.com \
  --type A \
  --name learning \
  --target 172.104.26.244
```

## Quick Deployment Guide

### 1. Clone Your GitHub Repository
```bash
cd /var/www/learning.chrispeterkins.com
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git .
```

### 2. Set Up GitHub Deploy Key (Recommended for Private Repos)

Generate SSH key on your Linode server:
```bash
ssh-keygen -t ed25519 -C "learning.chrispeterkins.com" -f ~/.ssh/github_deploy_key
```

Add the public key to your GitHub repo:
1. Copy the public key: `cat ~/.ssh/github_deploy_key.pub`
2. Go to GitHub repo → Settings → Deploy keys
3. Add deploy key with read access

Configure Git to use the key:
```bash
cat >> ~/.ssh/config << EOF
Host github-learning
  HostName github.com
  User git
  IdentityFile ~/.ssh/github_deploy_key
EOF
```

Clone using the deploy key:
```bash
git clone git@github-learning:YOUR_USERNAME/YOUR_REPO.git .
```

### 3. Install Dependencies & Build
```bash
npm install
npm run build  # For Next.js or build step
```

### 4. Start with PM2
```bash
# For static Next.js site (already configured):
pm2 start ecosystem.config.js

# Save PM2 config:
pm2 save
pm2 startup  # Follow the instructions it gives
```

### 5. Set Up SSL with Let's Encrypt

Install Certbot:
```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
```

Get SSL certificate:
```bash
sudo certbot --nginx -d learning.chrispeterkins.com --non-interactive --agree-tos --email your-email@example.com
```

### 6. Configure Firewall (Linode Cloud Firewall)

Via Linode Cloud Manager:
1. Go to **Firewalls** → Create or Edit existing
2. Add Inbound Rules:
   - SSH: Port 22 (your IP only for security)
   - HTTP: Port 80 (all IPs)
   - HTTPS: Port 443 (all IPs)
3. Attach to your Linode

Via command line (ufw):
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## Automated Deployment

### Option 1: Simple Webhook (Recommended)

1. Create webhook receiver:
```bash
npm install express crypto
```

2. Create `/var/www/learning.chrispeterkins.com/webhook-server.js`:
```javascript
const express = require('express');
const crypto = require('crypto');
const { exec } = require('child_process');

const app = express();
const SECRET = 'generate-random-secret-here'; // Change this!
const PORT = 9001;

app.use(express.raw({ type: 'application/json' }));

app.post('/deploy', (req, res) => {
  const signature = req.headers['x-hub-signature-256'];
  const hash = 'sha256=' + crypto
    .createHmac('sha256', SECRET)
    .update(req.body)
    .digest('hex');
  
  if (signature === hash) {
    exec('cd /var/www/learning.chrispeterkins.com && ./deploy.sh', 
      (error, stdout, stderr) => {
        if (error) console.error(error);
        console.log(stdout);
      }
    );
    res.status(200).send('Deploy started');
  } else {
    res.status(401).send('Unauthorized');
  }
});

app.listen(PORT, () => {
  console.log(`Webhook server on port ${PORT}`);
});
```

3. Start webhook server with PM2:
```bash
pm2 start webhook-server.js --name learning-webhook
pm2 save
```

4. In GitHub repo settings → Webhooks:
   - URL: `http://learning.chrispeterkins.com:9001/deploy`
   - Secret: Your secret from step 2
   - Events: Just push events

### Option 2: GitHub Actions (Alternative)

Create `.github/workflows/deploy.yml` in your repo:
```yaml
name: Deploy to Linode

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - name: Deploy to server
      uses: appleboy/ssh-action@master
      with:
        host: 172.104.26.244
        username: root
        key: ${{ secrets.SERVER_SSH_KEY }}
        script: |
          cd /var/www/learning.chrispeterkins.com
          git pull
          npm install
          npm run build
          pm2 restart learning.chrispeterkins.com
```

Add your server's SSH private key to GitHub Secrets as `SERVER_SSH_KEY`.

## Testing Your Setup

### 1. Check DNS (wait 5-30 minutes after adding record):
```bash
# From your local machine:
nslookup learning.chrispeterkins.com
# Should return: 172.104.26.244
```

### 2. Test Server Response:
```bash
# On the Linode server:
curl http://localhost:3002

# From outside (after DNS propagates):
curl http://learning.chrispeterkins.com
```

### 3. Monitor Logs:
```bash
# PM2 logs:
pm2 logs learning.chrispeterkins.com

# Nginx logs:
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## Troubleshooting

### DNS not working:
- Wait up to 30 minutes for propagation
- Check Linode DNS settings are saved
- Try: `dig @8.8.8.8 learning.chrispeterkins.com`

### Site not accessible:
```bash
# Check if app is running:
pm2 status

# Check if port is listening:
ss -tlnp | grep 3002

# Check nginx:
sudo nginx -t
sudo systemctl status nginx

# Check firewall:
sudo ufw status
```

### SSL certificate issues:
```bash
# Test renewal:
sudo certbot renew --dry-run

# Force renewal:
sudo certbot renew --force-renewal
```

## Multiple Subdomains Quick Setup

For each new subdomain (e.g., api.chrispeterkins.com):
```bash
# 1. Add DNS A record in Linode (same IP)
# 2. Create directory:
mkdir -p /var/www/api.chrispeterkins.com

# 3. Copy nginx template:
cp /etc/nginx/sites-available/learning.chrispeterkins.com \
   /etc/nginx/sites-available/api.chrispeterkins.com

# 4. Edit nginx config (change port to 3003, domain name)
nano /etc/nginx/sites-available/api.chrispeterkins.com

# 5. Enable and reload:
ln -s /etc/nginx/sites-available/api.chrispeterkins.com \
      /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# 6. Get SSL:
sudo certbot --nginx -d api.chrispeterkins.com
```

## Linode-Specific Tips

1. **Use Linode Backups**: Enable in Linode dashboard for easy recovery
2. **NodeBalancer**: For high traffic, consider Linode's load balancer
3. **Object Storage**: Use Linode Object Storage for static assets
4. **Monitoring**: Enable Linode Longview for detailed metrics

## Support Resources

- Linode Docs: https://www.linode.com/docs/
- Linode Community: https://www.linode.com/community/
- Your server IP: 172.104.26.244
- Main domain: chrispeterkins.com
- New subdomain: learning.chrispeterkins.com