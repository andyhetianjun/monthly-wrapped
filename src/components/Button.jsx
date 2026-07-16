import React from "react";

export const Button = ({ onClick, text, color = "#ed6752" }) => {
  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: color,
        borderRadius: "4px",
        border: "2",
        fontSize: "20px",
        cursor: "pointer",
        padding: "8px 40px",
      }}
    >
      {text}
    </button>
  );
};
