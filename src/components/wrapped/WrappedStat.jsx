import React from "react";

export const WrappedStat = ({ title, stat }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <span style={{ fontWeight: 500 }}>{title}</span>
      <span style={{ fontWeight: 700, fontSize: 30 }}>{stat}</span>
    </div>
  );
};
