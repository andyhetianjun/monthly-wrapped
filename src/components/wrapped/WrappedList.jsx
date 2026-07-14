import React from "react";

export const WrappedList = ({ title, list }) => {
  return (
    <div>
      <span style={{ fontWeight: 500 }}>{title}</span>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {list?.map((item, rank) => {
          return <strong key={rank}>{`${rank + 1} ${item}`}</strong>;
        })}
      </div>
    </div>
  );
};
