# Cloud Movie API

This is a Nuxt 4 + Nitro API that proxies MovieBox-style catalog and playback requests through mirror hosts. The app exposes JSON endpoints under `/api/stream/**` and is intended to be deployed as a Node web service or Docker container.

## Local Setup

Install dependencies:

```bash
npm install
```

Run the app in development:

```bash
npm run dev
```

Open `http://localhost:3000/` for the root page and `http://localhost:3000/api/stream/home` for a sample API response.

## Build For Production

Build the app:

```bash
npm run build
```

Nitro outputs the production server to `.output/server/index.mjs`. That is the process all production platforms should run.

## GitHub Deployment Flow

This repository is set up so you can connect the same GitHub repo to either platform.

- For DigitalOcean App Platform, use the repository directly and let it build from the Dockerfile.
- For Render, use the repository directly and let it build from the Dockerfile.

Both platforms will pick up the same source of truth from GitHub.

## Deploy On DigitalOcean App Platform

1. In DigitalOcean, create a new App and connect the GitHub repository.
2. Choose the branch you want to deploy.
3. Set the app type to a Web Service.
4. Let DigitalOcean detect the Dockerfile in the repository.
5. Add environment variables if needed. The current code reads `API_SECRET_KEY` into Nuxt runtime config, but it is not required for the tested routes.
6. Deploy and open the app URL that DigitalOcean assigns.

If you prefer manual settings instead of Docker auto-detect, use `npm run build` as the build command and `npm start` as the run command.

## Deploy On Render

1. Create a new Web Service on Render and connect the same GitHub repository.
2. Select the branch you want to deploy.
3. Render should detect the Dockerfile automatically.
4. Add environment variables if needed.
5. Deploy the service and use the Render URL it creates.

If you choose manual settings instead of Docker auto-detect, use `npm run build` as the build command and `npm start` as the start command.

Recommended settings:

- Node version: 20 or newer
- Instance size: start with the smallest web service plan, then scale if traffic grows
- Health check path: `/api/stream/home` or `/`
- Container port: `3000` is fine for local testing; production platforms should map their own port to the container

## How To Use It

All API routes are under the same base URL as the deployed app.

Examples:

```bash
curl https://YOUR-APP-URL/api/stream/home
curl https://YOUR-APP-URL/api/stream/trending?page=1
curl https://YOUR-APP-URL/api/stream/ranking-list?id=997144265920760504&page=1&type=all
curl https://YOUR-APP-URL/api/stream/movie-details?id=2966181623634480144
curl https://YOUR-APP-URL/api/stream/vid-source?detailPath=colony-06FbDRS87x3&sea=0&eps=0
```

The most useful routes are:

- `/api/stream/home` - featured content list
- `/api/stream/trending?page=1` - trending list
- `/api/stream/ranking-list?id=...&page=1&type=all` - ranking list
- `/api/stream/movie-details?id=...` - subject details
- `/api/stream/vid-source?detailPath=...&sea=0&eps=0` - playback sources and captions
- `/api/stream/download-proxy?url=...` - direct download/stream proxy
- `/api/stream/streaming-proxy?url=...` - range-aware stream proxy for supported video URLs

## Observed Runtime Behavior

I tested the running app locally and confirmed these behaviors:

- `/` returns `200` and renders the Nuxt page.
- `/api/stream/home` returns `200` with JSON catalog data.
- `/api/stream/trending` returns `200` with JSON catalog data.
- `/api/stream/ranking-list` returns `200` with JSON catalog data.
- `/api/stream/movie-details` returns `200` with subject detail data.
- `/api/stream/vid-source` returns `200` with stream options and captions for a valid `detailPath`.
- `/api/stream/search` currently returns the app's fallback error response in local testing, so clients should handle `{ error: true }` gracefully.

## Notes

- The API depends on external mirror hosts defined in `server/utils/mirorhost.ts`.
- CORS is enabled for `/api/stream/**` routes in `nuxt.config.ts`.
- Playback and download routes are intended to be consumed by clients that know how to handle stream URLs and byte-range requests.
