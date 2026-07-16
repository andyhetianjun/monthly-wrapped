import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import querystring from "querystring";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

dotenv.config({ path: ".env" });

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectUri = process.env.REDIRECT_URI;
const clientUrl = process.env.CLIENT_URL || "http://127.0.0.1:3000";
const port = process.env.PORT || 5000;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, "..", "dist");

const app = express();
app.use(cors({ origin: clientUrl, credentials: true }));
app.use(express.json());

const generateRandomString = (length) => {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
};

app.get("/login", (req, res) => {
  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: clientId,
        scope:
          "user-read-private user-read-email user-top-read user-read-recently-played",
        redirect_uri: redirectUri,
        state: generateRandomString(16),
        show_dialog: true,
      })
  );
});

app.get("/callback", async (req, res) => {
  const code = req.query.code || null;
  const state = req.query.state || null;

  if (!state) {
    return res.redirect(`${clientUrl}/#error=state_mismatch`);
  }

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      querystring.stringify({
        code: code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
      {
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            Buffer.from(clientId + ":" + clientSecret).toString("base64"),
        },
      }
    );

    // Hand the token to the browser via the URL fragment. No per-user state
    // lives on the server, so any number of people can use it at once.
    const accessToken = response.data.access_token;
    res.redirect(`${clientUrl}/#access_token=${accessToken}`);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.redirect(`${clientUrl}/#error=token_exchange_failed`);
  }
});

// In production the Express server also serves the built React app, so the
// whole thing runs as a single service (no CORS, one URL for the redirect).
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res) => res.sendFile(path.join(distPath, "index.html")));
}

app.listen(port, () => console.log(`Server running on port ${port}`));
