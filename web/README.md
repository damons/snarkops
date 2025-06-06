# snops Web Frontend

This directory contains a React single page application that provides a web
interface to the `snops` control plane.

The app relies on the TypeScript SDK located in `../sdk_ts` and communicates
with the control plane using the existing REST and WebSocket endpoints.

## Getting Started

```bash
npm install
npm run dev
```

By default the development server proxies API requests to `http://localhost:1234`.
Adjust the proxy in `vite.config.ts` if your control plane runs elsewhere.

You can also specify the control plane URL directly using the `VITE_CONTROL_PLANE_URL`
environment variable. Set this when running the dev server or building the app
to have the frontend talk to a remote control plane.
