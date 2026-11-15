import React from "react";

function Guide() {
  return (
    <div
      style={{
        position: "fixed",

        zIndex: 9999,
        fontFamily: "monospace",
        color: "#FBFBFB",
        fontSize: "0.9em",
        left: "2vw",
        bottom: "2vh",
        background: "black",
        padding: "2em",
        borderRadius: "1vw",
        opacity: 0.7,
      }}
    >
      <span style={{ color: "#fbfbfb" }}>
        Click or tap anywhere on the screen to aim and launch the ball.
      </span>
    </div>
  );
}

export default Guide;
