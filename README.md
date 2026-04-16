# Simple Chat App (Ollama)

Minimal HTML UI + production-style TypeScript/Express backend that talks to a local Ollama server.

## Prerequisites

- Node.js >= 18
- Ollama running locally (default `http://127.0.0.1:11434`)

## Configure

Copy `.env.example` to `.env` and adjust:

- `OLLAMA_MODEL` (must exist in your Ollama instance)

## Run (dev)

```sh
npm install
npm run dev
```

Open `http://localhost:3000`.

## Build (prod)

```sh
npm run build
npm start
```

## Test

```sh
npm test
```

