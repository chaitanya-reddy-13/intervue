module.exports = {
  apps: [
    {
      name: 'polling-backend',
      script: 'server.js',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 5000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 5000,
        CORS_ORIGIN: process.env.CORS_ORIGIN || '*'
      }
    }
  ]
};
