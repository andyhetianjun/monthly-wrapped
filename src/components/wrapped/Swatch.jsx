import React from "react";

// Decorative swatch built from real divs so html2canvas captures it reliably
// (CSS conic/repeating gradients don't render in the download).
export const Swatch = ({ shape, color }) => {
  if (shape === "dots") {
    return (
      <div style={{ display: "flex", flexWrap: "wrap", width: 72, height: 72, flexShrink: 0 }}>
        {Array.from({ length: 16 }).map((_, i) => {
          const filled = (Math.floor(i / 4) + (i % 4)) % 2 === 0;
          return (
            <div
              key={i}
              style={{
                width: 18,
                height: 18,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  backgroundColor: filled ? color : "transparent",
                }}
              />
            </div>
          );
        })}
      </div>
    );
  }

  if (shape === "stripes") {
    return (
      <div style={{ display: "flex", gap: 6, width: 72, height: 72, flexShrink: 0 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ flex: 1, backgroundColor: color }} />
        ))}
      </div>
    );
  }

  if (shape === "rings") {
    return (
      <div style={{ position: "relative", width: 72, height: 72, flexShrink: 0 }}>
        {[72, 48, 24].map((d) => (
          <div
            key={d}
            style={{
              position: "absolute",
              top: (72 - d) / 2,
              left: (72 - d) / 2,
              width: d,
              height: d,
              borderRadius: "50%",
              border: `4px solid ${color}`,
              boxSizing: "border-box",
            }}
          />
        ))}
      </div>
    );
  }

  if (shape === "plus") {
    const cross = [1, 3, 4, 5, 7];
    return (
      <div style={{ display: "flex", flexWrap: "wrap", width: 72, height: 72, flexShrink: 0 }}>
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 24,
              height: 24,
              backgroundColor: cross.includes(i) ? color : "transparent",
            }}
          />
        ))}
      </div>
    );
  }

  // checker (default)
  return (
    <div style={{ display: "flex", flexWrap: "wrap", width: 72, height: 72, flexShrink: 0 }}>
      {Array.from({ length: 16 }).map((_, i) => {
        const filled = (Math.floor(i / 4) + (i % 4)) % 2 === 0;
        return (
          <div
            key={i}
            style={{ width: 18, height: 18, backgroundColor: filled ? color : "transparent" }}
          />
        );
      })}
    </div>
  );
};
