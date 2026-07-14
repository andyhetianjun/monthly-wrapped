import React from "react";

export const Button = ({ onClick, text }) => {
  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: "#ed6752",
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
