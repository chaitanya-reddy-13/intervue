# Deployment Guide

## Quick Start (Local Development)

1. **Install all dependencies**:
   ```bash
   npm run setup
   ```

2. **Start both servers**:
   ```bash
   npm run dev
   ```

   This will start:
   - Backend server on `http://localhost:5000`
   - Frontend app on `http://localhost:3000`

## Production Deployment

### Option 1: Heroku Deployment

#### Backend (Heroku)

1. **Create a new Heroku app**:
   ```bash
   cd backend
   heroku create your-polling-backend
   ```

2. **Set environment variables**:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set CORS_ORIGIN=https://your-frontend-domain.netlify.app
   ```

3. **Deploy**:
   ```bash
   git init
   git add .
   git commit -m "Initial backend deployment"
   git push heroku main
   ```

#### Frontend (Netlify)

1. **Build the app**:
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Netlify**:
   - Drag and drop the `build` folder to Netlify
   - Or connect your GitHub repo for automatic deployments

3. **Set environment variable in Netlify**:
   - Go to Site Settings > Environment Variables
   - Add: `REACT_APP_SERVER_URL` = `https://your-polling-backend.herokuapp.com`

### Option 2: Railway/Render Deployment

#### Backend (Railway/Render)

1. **Connect your GitHub repo**
2. **Set environment variables**:
   ```
   NODE_ENV=production
   CORS_ORIGIN=https://your-frontend-domain.com
   PORT=5000
   ```
3. **Deploy command**: `npm start`

#### Frontend (Vercel/Netlify)

1. **Connect your GitHub repo**
2. **Build command**: `npm run build`
3. **Output directory**: `build`
4. **Environment variables**:
   ```
   REACT_APP_SERVER_URL=https://your-backend-domain.com
   ```

### Option 3: VPS/Cloud Server

#### Backend

1. **Install Node.js and PM2**:
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   nvm install node
   npm install -g pm2
   ```

2. **Clone and setup**:
   ```bash
   git clone your-repo
   cd polling/backend
   npm install
   ```

3. **Set environment variables**:
   ```bash
   export NODE_ENV=production
   export PORT=5000
   export CORS_ORIGIN=https://your-frontend-domain.com
   ```

4. **Start with PM2**:
   ```bash
   pm2 start ecosystem.config.js --env production
   pm2 save
   pm2 startup
   ```

#### Frontend

1. **Build and serve**:
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **Serve with nginx** or any static file server:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /path/to/polling/frontend/build;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

## Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com
POLL_TIMEOUT=60000
```

### Frontend (Netlify/Vercel Environment Variables)
```
REACT_APP_SERVER_URL=https://your-backend-domain.com
```

## Features Verification Checklist

After deployment, verify these features work:

- [ ] **Role Selection**: Choose between Student/Teacher
- [ ] **Student Flow**:
  - [ ] Name entry and validation
  - [ ] Wait for teacher questions
  - [ ] Submit answers with timer
  - [ ] View live results
- [ ] **Teacher Flow**:
  - [ ] Create polls with multiple options
  - [ ] Set time limits
  - [ ] View live results
  - [ ] Manage participants
  - [ ] View poll history
- [ ] **Real-time Features**:
  - [ ] Live result updates
  - [ ] Student join/leave notifications
  - [ ] Chat functionality
  - [ ] Timer synchronization
- [ ] **Responsive Design**:
  - [ ] Mobile friendly
  - [ ] Tablet friendly
  - [ ] Desktop optimized

## Troubleshooting

### Common Issues

1. **CORS Errors**: Update `CORS_ORIGIN` in backend environment variables
2. **Socket Connection Failed**: Check if backend server is running and accessible
3. **Frontend not loading**: Verify `REACT_APP_SERVER_URL` points to correct backend
4. **Chat not working**: Ensure WebSocket connections are allowed (check firewall/proxy)

### Development Issues

1. **Port conflicts**: Change PORT in backend .env or kill conflicting processes
2. **Module not found**: Run `npm install` in both directories
3. **TypeScript errors**: Check if all types are properly imported

### Performance Optimization

1. **For high traffic**: Use Redis for session storage instead of in-memory
2. **For multiple rooms**: Implement room-based polling
3. **For large scale**: Use load balancers and multiple server instances
