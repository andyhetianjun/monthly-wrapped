import React from "react";

export const RecordPlayer = ({ size = 200 }) => {
  return (
    <div style={{ width: size, height: size, position: "relative" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background:
            "repeating-radial-gradient(#111 0 6px, #1c1c1c 6px 8px)",
          animation: "spin 3s linear infinite",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
        }}
      >
        <div
          style={{
            width: size * 0.32,
            height: size * 0.32,
            borderRadius: "50%",
            backgroundColor: "#ed6752",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: "#111",
            }}
          />
        </div>
      </div>
    </div>
  );
};
