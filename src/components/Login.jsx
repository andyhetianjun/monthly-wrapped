import React from "react";
import { Button } from "./Button";
import { RecordPlayer } from "./RecordPlayer";
import { Swatch } from "./wrapped/Swatch";

const ACCENT = "#ed6752";
const PINK = "#ddb2ba";

// Biggest in the centre, tapering to the sides.
const DISCS = [
  { color: "#2f6f9f", size: 120 },
  { color: "#0f9d58", size: 155 },
  { color: "#ed6752", size: 190 },
  { color: "#f7c948", size: 155 },
  { color: "#e8577d", size: 120 },
];

// Scattered decorative swatches (our card symbols) tucked around the edges.
const DECOR = [
  { shape: "checker", top: "8%", left: "6%", scale: 0.85, rotate: -8 },
  { shape: "dots", top: "12%", right: "8%", scale: 0.75, rotate: 6 },
  { shape: "rings", bottom: "14%", left: "9%", scale: 0.8, rotate: 0 },
  { shape: "plus", bottom: "10%", right: "7%", scale: 0.85, rotate: 10 },
  { shape: "stripes", top: "46%", left: "3%", scale: 0.6, rotate: -6 },
  { shape: "dots", top: "44%", right: "3%", scale: 0.6, rotate: 0 },
];

export const Login = () => {
  const redirect = () => {
    window.location.href = "http://127.0.0.1:5000/login";
  };

  return (
    <div
      className="login"
      style={{
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "18px",
        width: "100%",
        minHeight: "100vh",
        padding: "16px",
        boxSizing: "border-box",
        backgroundColor: PINK,
      }}
    >
      {/* Decorative symbols */}
      {DECOR.map((d, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: d.top,
            bottom: d.bottom,
            left: d.left,
            right: d.right,
            transform: `scale(${d.scale}) rotate(${d.rotate}deg)`,
            opacity: 0.5,
            pointerEvents: "none",
          }}
        >
          <Swatch shape={d.shape} color={ACCENT} />
        </div>
      ))}

      {/* Title */}
      <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        <div
          style={{
            fontSize: "clamp(0.75rem, 2.6vw, 0.95rem)",
            fontWeight: 700,
            letterSpacing: "0.38em",
            textTransform: "uppercase",
            color: ACCENT,
            marginBottom: "4px",
            marginRight: "-0.38em",
          }}
        >
          Monthly
        </div>
        <h1
          style={{
            margin: 0,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            lineHeight: 1.02,
            fontSize: "clamp(1.9rem, 7vw, 3rem)",
            color: "#1a1a1a",
            textShadow: "0 2px 22px rgba(255, 255, 255, 0.5)",
          }}
        >
          Spotify Wrapped
        </h1>
        <div
          style={{
            marginTop: "8px",
            fontWeight: 700,
            color: "#3a2a2c",
            fontSize: "clamp(0.85rem, 2.4vw, 1rem)",
          }}
        >
          It's like Spotify Wrapped, but for your monthly stats :)
        </div>
      </div>

      {/* Five overlapping spinning discs, biggest in the centre */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "12px 24px",
          margin: "4px 0",
        }}
      >
        {DISCS.map((disc, i) => (
          <div
            key={i}
            style={{
              marginLeft: i === 0 ? 0 : -42,
              flexShrink: 0,
              zIndex: disc.size,
            }}
          >
            <RecordPlayer size={disc.size} accent={disc.color} />
          </div>
        ))}
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        <Button onClick={redirect} text={"Login"} color={ACCENT} />
      </div>
    </div>
  );
};
