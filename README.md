# Monthly Spotify Wrapped

Spotify Wrapped, but for your monthly (last ~4 weeks) listening stats.

## Setup

1. Create an app at https://developer.spotify.com/dashboard
2. Add this Redirect URI to the app: `http://127.0.0.1:5000/callback`
3. Copy `.env.example` to `.env` and fill in your Client ID and Secret.

## Install

```bash
npm install
cd server && npm install && cd ..
```

## Run (two terminals)

```bash
npm run server   # backend on 127.0.0.1:5000
npm run dev      # frontend on 127.0.0.1:3000
```

Then open http://127.0.0.1:3000 (use 127.0.0.1, not localhost).

## Notes

- The access token lasts ~1 hour. When it expires, API calls will 401 —
  clear localStorage (or add a refresh-token flow) to log back in.
- The token is stored in a single server variable, so it's built for one user
  at a time (fine for personal local use).
