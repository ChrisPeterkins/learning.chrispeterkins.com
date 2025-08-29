module.exports = {
  apps: [
    {
      name: 'learning.chrispeterkins.com',
      script: './server.js',
      cwd: '/var/www/learning.chrispeterkins.com',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      error_file: '/var/log/pm2/learning-error.log',
      out_file: '/var/log/pm2/learning-out.log',
      log_file: '/var/log/pm2/learning-combined.log',
      time: true
    }
  ]
};