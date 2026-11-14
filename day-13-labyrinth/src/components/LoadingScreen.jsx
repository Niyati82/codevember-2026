import React from "react";

function LoadingScreen() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#030303",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        // fontFamily: "monospace",
        color: "#FFBF00",
      }}
    >
      {/* Loading Text */}
      <div
        style={{
          fontSize: "0.9em",
          marginBottom: "20px",
          transition: "opacity 0.5s ease",
        }}
      >
        Preparing Scene
      </div>

      {/* Horizontal Loading Bar */}
      <div
        style={{
          width: "16vw",
          height: "0.3vh",
          background: "#252525",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "#FFBF00",
            transformOrigin: "left",
            animation: "loadingBar 4s linear forwards",
          }}
        />
      </div>

      <style>
        {`
          @keyframes loadingBar {
            0% {
              transform: scaleX(0);
            }
            100% {
              transform: scaleX(1);
            }
          }
        `}
      </style>
    </div>
  );
}

export default LoadingScreen;
