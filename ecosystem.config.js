module.exports = {
  apps: [
    {
      name: 'rabota',
      script: 'dist/main.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3333,
      },
      watch: false,
      autorestart: true, // Ensuring the app restarts on crashes
    },
  ],
};
