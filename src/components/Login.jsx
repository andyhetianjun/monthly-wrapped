import React, { useRef, useState } from "react";
import { Button } from "./Button";
import { RecordPlayer } from "./RecordPlayer";
import { Swatch } from "./wrapped/Swatch";

const ACCENT = "#ed6752";
const PINK = "#ddb2ba";

// Ordered so the centre slot starts on the orange disc.
const DISCS = ["#0f9d58", "#2f6f9f", "#ed6752", "#f7c948", "#e8577d"];
const DISC_BASE = 190;

// Decorative swatches (our card symbols) scattered densely across the page.
const DECOR = [
  { shape: "checker", top: "5%", left: "4%", scale: 0.85, rotate: -8 },
  { shape: "dots", top: "9%", left: "23%", scale: 0.55, rotate: 6 },
  { shape: "plus", top: "6%", left: "45%", scale: 0.5, rotate: 12 },
  { shape: "rings", top: "10%", left: "67%", scale: 0.55, rotate: 0 },
  { shape: "stripes", top: "6%", left: "89%", scale: 0.6, rotate: 8 },

  { shape: "dots", top: "30%", left: "2%", scale: 0.6, rotate: 0 },
  { shape: "plus", top: "34%", left: "17%", scale: 0.45, rotate: -10 },
  { shape: "checker", top: "32%", left: "80%", scale: 0.5, rotate: 10 },
  { shape: "stripes", top: "28%", left: "92%", scale: 0.55, rotate: -6 },

  { shape: "rings", top: "52%", left: "5%", scale: 0.7, rotate: 0 },
  { shape: "dots", top: "50%", left: "90%", scale: 0.6, rotate: 0 },
  { shape: "plus", top: "60%", left: "24%", scale: 0.5, rotate: 14 },
  { shape: "stripes", top: "58%", left: "70%", scale: 0.5, rotate: -8 },

  { shape: "checker", top: "82%", left: "9%", scale: 0.7, rotate: 6 },
  { shape: "dots", top: "88%", left: "38%", scale: 0.55, rotate: 0 },
  { shape: "rings", top: "84%", left: "64%", scale: 0.6, rotate: 0 },
  { shape: "plus", top: "86%", left: "90%", scale: 0.8, rotate: 10 },
];

// Signed distance of disc i from the centred disc, wrapped to [-2, 2].
const relOf = (i, center, n) => {
  let d = (i - center) % n;
  if (d > n / 2) d -= n;
  if (d < -n / 2) d += n;
  return d;
};

const SLOT = {
  0: { x: 0, scale: 1, z: 30, opacity: 1 },
  1: { x: 112, scale: 0.78, z: 20, opacity: 0.92 },
  2: { x: 200, scale: 0.56, z: 10, opacity: 0.7 },
};

export const Login = () => {
  const [center, setCenter] = useState(2);
  const audioRef = useRef(null);
  const dragRef = useRef({ active: false, startX: 0, moved: false });

  // Satisfying "tok" click: a pitched blip that drops in frequency, layered
  // with a short noise transient for the snappy attack.
  const playClick = () => {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      const ctx = audioRef.current || (audioRef.current = new Ctx());
      if (ctx.state === "suspended") ctx.resume();
      const now = ctx.currentTime;

      // Tonal body — quick downward pitch sweep.
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(360, now + 0.07);
      const oGain = ctx.createGain();
      oGain.gain.setValueAtTime(0.0001, now);
      oGain.gain.exponentialRampToValueAtTime(0.3, now + 0.004);
      oGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);
      osc.connect(oGain);
      oGain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);

      // Noise transient — the crisp attack.
      const size = Math.floor(ctx.sampleRate * 0.03);
      const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < size; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / size, 6);
      }
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 2600;
      const nGain = ctx.createGain();
      nGain.gain.value = 0.18;
      src.connect(filter);
      filter.connect(nGain);
      nGain.connect(ctx.destination);
      src.start(now);
    } catch (e) {
      // no audio available; ignore
    }
  };

  const rotate = (dir) => {
    setCenter((c) => (c + dir + DISCS.length) % DISCS.length);
    playClick();
  };

  const onPointerDown = (e) => {
    dragRef.current = { active: true, startX: e.clientX, moved: false };
  };
  const onPointerMove = (e) => {
    const drag = dragRef.current;
    if (!drag.active) return;
    const dx = e.clientX - drag.startX;
    if (Math.abs(dx) >= 70) {
      rotate(dx < 0 ? 1 : -1);
      drag.startX = e.clientX;
      drag.moved = true;
    }
  };
  const endDrag = () => {
    dragRef.current.active = false;
  };

  const onDiscClick = (i) => {
    if (dragRef.current.moved) return; // was a drag, not a click
    if (i === center) rotate(1);
    else {
      setCenter(i);
      playClick();
    }
  };

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

      {/* Cyclic disc carousel — drag or click to shuffle, centred on the middle */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        style={{
          position: "relative",
          zIndex: 1,
          width: "min(520px, 96vw)",
          height: "230px",
          margin: "4px 0",
          cursor: "grab",
          touchAction: "none",
          userSelect: "none",
        }}
      >
        {DISCS.map((color, i) => {
          const rel = relOf(i, center, DISCS.length);
          const slot = SLOT[Math.abs(rel)];
          const x = Math.sign(rel) * slot.x;
          return (
            <div
              key={i}
              onClick={() => onDiscClick(i)}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: `translate(-50%, -50%) translateX(${x}px) scale(${slot.scale})`,
                transition: "transform 320ms ease, opacity 320ms ease",
                zIndex: slot.z,
                opacity: slot.opacity,
                cursor: "pointer",
              }}
            >
              <RecordPlayer size={DISC_BASE} accent={color} />
            </div>
          );
        })}
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        <Button onClick={redirect} text={"Login"} color={ACCENT} />
      </div>
    </div>
  );
};
