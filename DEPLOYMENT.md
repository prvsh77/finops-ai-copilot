# Production Deployment Guide

FinOps AI Copilot is built to be deployed as a containerized stack using Docker or standard container service runtimes.

---

## 🐋 Docker Compose Deployment
To build and execute the backend gateway and static assets server in production mode:

```bash
# Build and run containers in background mode
docker-compose up -d --build
```

The stack exposes:
* **Static Asset Server**: Port `80` (mapped to Nginx or static file serving)
* **REST API Gateway**: Port `8080` (routed via container network proxies)

---

## 📦 Manual Production Build

### 1. Build Frontend Static Assets
Vite compiles and minifies JS and CSS bundles under the `dist/` directory:

```bash
# Production Vite build
npm run build
```

These files can be deployed to AWS S3, Cloudflare Pages, Netlify, or Nginx static roots.

### 2. Run API Server in Production Mode
Ensure your production env features:
* `NODE_ENV=production`
* `PORT=8080`
* `API_DATA_FILE=/var/lib/finops/data.json` (Ensure file-system write permissions are set)

Start the server using PM2 or supervisor:

```bash
# Start backend server
node apps/api/src/server.mjs
```
