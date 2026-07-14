import React from "react";
import { Button } from "./Button";
import { RecordPlayer } from "./RecordPlayer";

export const Login = () => {
  const redirect = () => {
    window.location.href = "http://127.0.0.1:5000/login";
  };

  return (
    <div
      className="login"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "16px",
        width: "100%",
        height: "100vh",
        backgroundColor: "#ddb2ba",
      }}
    >
      <h1> Monthly Spotify Wrapped </h1>
      <span style={{ fontWeight: "bold" }}>
        {" "}
        It's like Spotify Wrapped but for your monthly stats :){" "}
      </span>

      <RecordPlayer />

      <Button onClick={redirect} text={"Login"} />
    </div>
  );
};
