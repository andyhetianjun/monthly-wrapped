import React from "react";

export const WrappedStat = ({ title, stat }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <span style={{ fontWeight: 500 }}>{title}</span>
      <span style={{ fontWeight: 800, fontSize: 30, lineHeight: 1.1 }}>
        {stat}
      </span>
    </div>
  );
};
