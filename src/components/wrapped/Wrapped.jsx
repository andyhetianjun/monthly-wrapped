import React, { useState } from "react";
import { useWrappedData } from "../../useWrappedData";
import html2canvas from "html2canvas";
import { WrappedList } from "./WrappedList";
import { WrappedStat } from "./WrappedStat";
import { Swatch } from "./Swatch";
import { Button } from "../Button";
import { RecordPlayer } from "../RecordPlayer";

// Cycle through these with the on-screen arrows. Each recolors the page,
// card, month text, download button, and picks a swatch shape.
const THEMES = [
  {
    name: "Blossom",
    pageBg: "#ddb2ba",
    tint: "rgba(221, 178, 186, 0.55)",
    accent: "#ed6752",
    cardBg: "#ffffff",
    cardText: "#111111",
    shape: "checker",
  },
  {
    name: "Mint",
    pageBg: "#bfe3d0",
    tint: "rgba(191, 227, 208, 0.55)",
    accent: "#0f9d58",
    cardBg: "#ffffff",
    cardText: "#111111",
    shape: "dots",
  },
  {
    name: "Midnight",
    pageBg: "#23232f",
    tint: "rgba(15, 15, 22, 0.55)",
    accent: "#f7c948",
    cardBg: "#17171f",
    cardText: "#ffffff",
    shape: "stripes",
  },
  {
    name: "Sunset",
    pageBg: "#f4b26a",
    tint: "rgba(244, 150, 90, 0.5)",
    accent: "#e8577d",
    cardBg: "#fff8f0",
    cardText: "#111111",
    shape: "plus",
  },
  {
    name: "Ocean",
    pageBg: "#a9c9e8",
    tint: "rgba(120, 170, 215, 0.5)",
    accent: "#2f6f9f",
    cardBg: "#ffffff",
    cardText: "#111111",
    shape: "rings",
  },
];

// Full-stage blurred wall of the user's album covers, behind the card.
const Backdrop = ({ covers }) => {
  if (!covers || covers.length === 0) return null;
  const tiles = Array.from({ length: 260 }, (_, i) => covers[i % covers.length]);
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 1, overflow: "hidden", pointerEvents: "none" }}>
      {/* Center the mosaic and overscan past every edge so partial tiles are
          clipped off-screen instead of leaving gaps (symmetric on all sides). */}
      <div
        style={{
          position: "absolute",
          inset: -150,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignContent: "center",
          opacity: 0.35,
          filter: "blur(2px)",
        }}
      >
        {tiles.map((url, i) => (
          <img
            key={i}
            src={url}
            alt=""
            style={{ width: 150, height: 150, objectFit: "cover", flexShrink: 0 }}
          />
        ))}
      </div>
    </div>
  );
};

const Arrow = ({ side, color, onClick }) => (
  <button
    onClick={onClick}
    aria-label={side === "left" ? "Previous theme" : "Next theme"}
    style={{
      position: "fixed",
      [side]: "clamp(4px, 2vw, 28px)",
      top: "50%",
      transform: "translateY(-50%)",
      zIndex: 10,
      background: "transparent",
      border: "none",
      cursor: "pointer",
      color,
      opacity: 0.8,
      fontSize: "clamp(2.2rem, 6vw, 3.6rem)",
      lineHeight: 1,
      padding: "10px",
      textShadow: "0 1px 8px rgba(0,0,0,0.25)",
    }}
  >
    {side === "left" ? "❮" : "❯"}
  </button>
);

export const Wrapped = ({ accessToken }) => {
  const [themeIndex, setThemeIndex] = useState(0);
  const theme = THEMES[themeIndex];

  const {
    isLoading,
    songs,
    artists,
    albumArt,
    topSongImg,
    topSongName,
    topDecade,
    uniqueArtists,
  } = useWrappedData(accessToken);

  const month = new Date()
    .toLocaleString("en-US", { month: "long" })
    .toUpperCase();

  const cycleTheme = (delta) =>
    setThemeIndex((i) => (i + delta + THEMES.length) % THEMES.length);

  const handleImageDownload = async () => {
    const element = document.getElementById("stage"),
      canvas = await html2canvas(element, {
        useCORS: true,
        backgroundColor: null,
        // Keep the Download button out of the captured image.
        ignoreElements: (el) =>
          el.classList && el.classList.contains("downloadBar"),
      }),
      data = canvas.toDataURL("image/jpg"),
      link = document.createElement("a");

    link.href = data;
    link.download = "spotify-wrapped.jpg";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div
        id="stage"
        style={{
          position: "relative",
          overflow: "hidden",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "8px 16px",
          boxSizing: "border-box",
        }}
      >
        {/* Background stack: base color · album wall · tint overlay */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0, backgroundColor: theme.pageBg }} />
        <Backdrop covers={albumArt} />
        <div style={{ position: "absolute", inset: 0, zIndex: 2, backgroundColor: theme.tint }} />

        <div
          className="wrappedPage"
          style={{
            position: "relative",
            zIndex: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
            width: "100%",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "clamp(0.75rem, 2.6vw, 0.95rem)",
                fontWeight: 700,
                letterSpacing: "0.38em",
                textTransform: "uppercase",
                color: theme.accent,
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
                color: theme.cardText === "#ffffff" ? "#ffffff" : "#1a1a1a",
                textShadow:
                  theme.cardText === "#ffffff"
                    ? "0 2px 22px rgba(0, 0, 0, 0.45)"
                    : "0 2px 22px rgba(255, 255, 255, 0.5)",
              }}
            >
              Spotify Wrapped
            </h1>
          </div>

          {isLoading ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "16px",
                width: "min(460px, 92vw)",
                height: "560px",
              }}
            >
              <strong> Loading... </strong>
              <RecordPlayer />
            </div>
          ) : (
            <div
              className="wrappedNode"
              id="print"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                width: "min(460px, 92vw)",
                boxSizing: "border-box",
                backgroundColor: theme.cardBg,
                color: theme.cardText,
                borderRadius: "22px",
                padding: "22px",
              }}
            >
              {/* Header: vertical month · hero art w/ song title · swatch */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "10px",
                }}
              >
                <span
                  style={{
                    writingMode: "vertical-rl",
                    transform: "rotate(180deg)",
                    fontWeight: 800,
                    fontSize: "42px",
                    letterSpacing: "1px",
                    color: theme.accent,
                    lineHeight: 1,
                  }}
                >
                  {month}
                </span>

                <div style={{ position: "relative", width: 190, height: 190 }}>
                  <img
                    width={190}
                    height={190}
                    src={topSongImg}
                    alt="top-song"
                    style={{
                      width: 190,
                      height: 190,
                      objectFit: "cover",
                      borderRadius: 8,
                      display: "block",
                    }}
                  />
                  {topSongName ? (
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        bottom: 0,
                        padding: "22px 10px 9px",
                        background:
                          "linear-gradient(transparent, rgba(0,0,0,0.78))",
                        color: "#ffffff",
                        fontWeight: 700,
                        fontSize: "14px",
                        lineHeight: 1.2,
                        borderRadius: "0 0 8px 8px",
                      }}
                    >
                      {topSongName}
                    </div>
                  ) : null}
                </div>

                <Swatch shape={theme.shape} color={theme.accent} />
              </div>

              {/* Lists + stats */}
              <div
                className="topStats"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                  fontSize: "15px",
                }}
              >
                <WrappedList title="Top Artists" list={artists} />
                <WrappedList title="Top Songs" list={songs} />
                <WrappedStat title="Top Decade" stat={topDecade} />
                <WrappedStat title="Unique Artists" stat={uniqueArtists} />
              </div>

              {/* Footer */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginTop: "2px",
                }}
              >
                <span
                  style={{
                    width: 15,
                    height: 15,
                    borderRadius: "50%",
                    backgroundColor: theme.accent,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "1px",
                  }}
                >
                  MONTHLY SPOTIFY WRAPPED
                </span>
              </div>
            </div>
          )}

          <div
            className="downloadBar"
            style={{
              display: "flex",
              justifyContent: "center",
              width: "100%",
              padding: "4px 0 8px",
            }}
          >
            <Button
              onClick={handleImageDownload}
              text={"Download"}
              color={theme.accent}
            />
          </div>
        </div>
      </div>

      {/* Theme arrows live outside #stage so they never end up in the download */}
      <Arrow side="left" color={theme.accent} onClick={() => cycleTheme(-1)} />
      <Arrow side="right" color={theme.accent} onClick={() => cycleTheme(1)} />
    </>
  );
};
