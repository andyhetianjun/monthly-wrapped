import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import querystring from "querystring";

dotenv.config({ path: ".env" });
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectUri = process.env.REDIRECT_URI;
const port = process.env.PORT || 5000;

const app = express();
app.use(
  cors({
    origin: "http://127.0.0.1:3000",
    credentials: true,
  })
);
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

let accessToken;

app.get("/callback", async (req, res) => {
  const code = req.query.code || null;
  const state = req.query.state || null;

  if (!state) {
    res.redirect("/#" + querystring.stringify({ error: "state_mismatch" }));
  } else {
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
      accessToken = response.data.access_token;
      res.redirect("http://127.0.0.1:3000/");
    } catch (err) {
      console.error(err.response?.data || err.message);
      res
        .status(500)
        .json({ error: "Failed to exchange authorization code for tokens" });
    }
  }
});

app.get("/accessToken", (req, res) => {
  res.json({ accessToken: accessToken || null });
});

app.get("/logout", (req, res) => {
  accessToken = undefined;
  res.json({ ok: true });
});

app.listen(port, () => console.log(`Server running on http://127.0.0.1:${port}`));
