import React, { useState, useEffect, useMemo } from "react";
import { useWrappedData } from "../../useWrappedData";
import html2canvas from "html2canvas";
import { WrappedList } from "./WrappedList";
import { WrappedStat } from "./WrappedStat";
import { Swatch } from "./Swatch";
import { Button } from "../Button";
import { RecordPlayer } from "../RecordPlayer";

// The set themes (the dynamic top-song theme is prepended at runtime). Each
// recolors the page, card, month text, download button, and swatch shape.
const SET_THEMES = [
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

// --- Colour helpers for deriving a theme from the top-song cover ---
const hexToRgb = (hex) => {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
};
const rgbToHex = (r, g, b) =>
  "#" +
  [r, g, b]
    .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0"))
    .join("");
const rgbToHsl = (r, g, b) => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  let s = 0;
  if (d) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return [h, s, l];
};
const hueOf = (hex) => rgbToHsl(...hexToRgb(hex))[0] * 360;
const hueDist = (a, b) => {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
};
const mix = (c1, c2, t) => c1.map((v, i) => v * (1 - t) + c2[i] * t);

// Load the cover cross-origin, sample it, and build a pastel theme from its
// most vibrant colour. Resolves null on any failure (falls back to set themes).
const extractTheme = (url) =>
  new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const S = 24;
        const canvas = document.createElement("canvas");
        canvas.width = S;
        canvas.height = S;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, S, S);
        const { data } = ctx.getImageData(0, 0, S, S);
        let best = null;
        let bestScore = -1;
        let rs = 0;
        let gs = 0;
        let bs = 0;
        let n = 0;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] < 125) continue;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          rs += r;
          gs += g;
          bs += b;
          n += 1;
          const [, s, l] = rgbToHsl(r, g, b);
          const score = s * (1 - Math.abs(l - 0.5));
          if (s > 0.35 && l > 0.2 && l < 0.8 && score > bestScore) {
            bestScore = score;
            best = [r, g, b];
          }
        }
        if (!n) return resolve(null);
        const accentRgb = best || [rs / n, gs / n, bs / n];
        const pageRgb = mix(accentRgb, [255, 255, 255], 0.62).map(Math.round);
        resolve({
          name: "Top Song",
          pageBg: rgbToHex(...pageRgb),
          tint: `rgba(${pageRgb[0]}, ${pageRgb[1]}, ${pageRgb[2]}, 0.55)`,
          accent: rgbToHex(...accentRgb),
          cardBg: "#ffffff",
          cardText: "#111111",
          shape: "checker",
        });
      } catch (e) {
        resolve(null); // tainted canvas / no CORS
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });

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
  const [dynamicTheme, setDynamicTheme] = useState(null);

  const {
    isLoading,
    songs,
    artists,
    albumArt,
    topSongImg,
    topSongName,
    topSongId,
    topDecade,
    uniqueArtists,
  } = useWrappedData(accessToken);

  // First theme is derived from the top song's cover; the rest are our set
  // themes, minus any whose hue is too close to the derived one (dedupe).
  const themes = useMemo(() => {
    if (!dynamicTheme) return SET_THEMES;
    const dHue = hueOf(dynamicTheme.accent);
    const rest = SET_THEMES.filter((t) => hueDist(hueOf(t.accent), dHue) > 28);
    return [dynamicTheme, ...rest];
  }, [dynamicTheme]);

  const theme = themes[Math.min(themeIndex, themes.length - 1)];

  // Derive the top-song theme once the cover is known; land on it first.
  useEffect(() => {
    if (!topSongImg) return;
    let cancelled = false;
    extractTheme(topSongImg).then((t) => {
      if (!cancelled && t) {
        setDynamicTheme(t);
        setThemeIndex(0);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [topSongImg]);

  const month = new Date()
    .toLocaleString("en-US", { month: "long" })
    .toUpperCase();

  const cycleTheme = (delta) =>
    setThemeIndex((i) => (i + delta + themes.length) % themes.length);

  const handleImageDownload = async () => {
    const element = document.getElementById("stage"),
      canvas = await html2canvas(element, {
        useCORS: true,
        backgroundColor: null,
        // Keep the Download button and web-only player out of the image.
        ignoreElements: (el) =>
          el.classList &&
          (el.classList.contains("downloadBar") ||
            el.classList.contains("spotifyPlayer")),
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
            gap: "6px",
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
                fontSize: "clamp(1.7rem, 6.5vw, 2.7rem)",
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
                gap: "10px",
                width: "min(460px, 92vw)",
                boxSizing: "border-box",
                backgroundColor: theme.cardBg,
                color: theme.cardText,
                borderRadius: "22px",
                padding: "16px",
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

                <div style={{ position: "relative", width: 150, height: 150 }}>
                  <img
                    width={150}
                    height={150}
                    src={topSongImg}
                    alt="top-song"
                    style={{
                      width: 150,
                      height: 150,
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

          {!isLoading && topSongId ? (
            <div
              className="spotifyPlayer"
              style={{
                width: "min(460px, 92vw)",
                lineHeight: 0,
                backgroundColor: theme.pageBg,
                padding: "6px",
                borderRadius: "16px",
                boxSizing: "border-box",
              }}
            >
              <iframe
                title="Top song player"
                src={`https://open.spotify.com/embed/track/${topSongId}`}
                width="100%"
                height="80"
                frameBorder="0"
                loading="lazy"
                allow="encrypted-media"
                style={{ borderRadius: "12px", display: "block" }}
              />
            </div>
          ) : null}

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
