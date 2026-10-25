# SmartSlot Deployment & Production Guide

## 1. Local Production Verification
The project can be verified in production mode locally:

```bash
# 1. Build Frontend
cd frontend
npm run build

# 2. Preview Production Build
npm run preview
```

## 2. Environment Variables Specification

### Backend (`backend/.env`):
| Variable | Description | Example |
|---|---|---|
| `PORT` | API server port | `5000` |
| `MONGODB_URI` | MongoDB Connection String | `mongodb://127.0.0.1:27017/smartslot` or Atlas URI |
| `JWT_SECRET` | Secret key for JWT signing | `production_secure_random_key_here` |
| `FRONTEND_ORIGIN` | Allowed CORS origin | `http://localhost:5173` or `https://smartslot.app` |
| `NODE_ENV` | Runtime environment | `production` |

### Frontend (`frontend/.env`):
| Variable | Description | Example |
|---|---|---|
| `VITE_API_BASE_URL` | Base endpoint path for backend API | `/api/v1` (proxied in dev) or full URL |

## 3. Docker Compose Specification
For containerized deployments, use `docker-compose.yml`:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7
    restart: always
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  backend:
    build: ./backend
    restart: always
    ports:
      - "5000:5000"
    environment:
      - PORT=5000
      - MONGODB_URI=mongodb://mongodb:27017/smartslot
      - JWT_SECRET=production_secret_key_12345
      - FRONTEND_ORIGIN=http://localhost:5173
      - NODE_ENV=production
    depends_on:
      - mongodb

volumes:
  mongo_data:
```

## 4. Live Cloud Deployment Instructions (Render / Railway / Vercel)
1. **Database**: Spin up a free MongoDB Atlas cluster and set `MONGODB_URI`.
2. **Backend**: Deploy `backend/` to Render or Railway with start command `node src/server.js`.
3. **Frontend**: Deploy `frontend/` to Vercel or Netlify with build command `npm run build` and output directory `dist`. Set `VITE_API_BASE_URL` to your backend Render URL.
