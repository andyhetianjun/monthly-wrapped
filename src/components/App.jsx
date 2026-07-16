import React, { useState } from "react";
import { Login } from "./Login";
import { Wrapped } from "./wrapped/Wrapped";

// After login the server redirects back with the token in the URL fragment
// (#access_token=...). Read it once, persist it, and strip it from the URL.
const readToken = () => {
  const hash = window.location.hash;
  if (hash && hash.includes("access_token")) {
    const token = new URLSearchParams(hash.slice(1)).get("access_token");
    if (token) {
      localStorage.setItem("accessToken", token);
      window.history.replaceState(null, "", window.location.pathname);
      return token;
    }
  }
  return localStorage.getItem("accessToken");
};

export const App = () => {
  const [accessToken] = useState(readToken);

  return !accessToken ? <Login /> : <Wrapped accessToken={accessToken} />;
};
