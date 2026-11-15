import { useEffect, useRef } from "react";

export default function MagneticCursor() {
  const cursorRef = useRef(null);

  useEffect(() => {
    const cursor = cursorRef.current;

    if (!cursor) return;

    const handleMouseMove = (e) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div ref={cursorRef} className="energy-cursor">
      <svg viewBox="0 0 100 100" className="energy-svg">
        <defs>
          <filter id="holo-glow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer holographic ring */}
        <circle
          cx="50"
          cy="50"
          r="43"
          fill="none"
          stroke="#ff2020"
          strokeWidth="2.5"
          strokeDasharray="105 30"
          strokeLinecap="round"
          filter="url(#holo-glow)"
        />

        {/* Neon white highlight */}
        <circle
          cx="50"
          cy="50"
          r="43"
          fill="none"
          stroke="#ffbcbc"
          strokeWidth="1"
          strokeDasharray="105 30"
          strokeLinecap="round"
        />

        {/* Inner holographic ring */}
        <circle
          cx="50"
          cy="50"
          r="31"
          fill="none"
          stroke="#ff3030"
          strokeWidth="1.8"
          strokeDasharray="75 18"
          strokeLinecap="round"
          filter="url(#holo-glow)"
        />

        {/* Tiny holographic nodes */}
        {[0, 90, 180, 270].map((angle) => {
          const rad = (angle * Math.PI) / 180;
          const x = 50 + Math.cos(rad) * 37;
          const y = 50 + Math.sin(rad) * 37;

          return (
            <circle
              key={angle}
              cx={x}
              cy={y}
              r="1.5"
              fill="#ffaaaa"
              filter="url(#holo-glow)"
            />
          );
        })}
      </svg>
    </div>
  );
}
