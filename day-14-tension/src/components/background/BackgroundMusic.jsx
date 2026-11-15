import { useEffect, useRef } from "react";

export default function BackgroundMusic() {
  const audioRef = useRef(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const audio = new Audio(`${import.meta.env.BASE_URL}scifi-ambient.mp3`);

    audio.loop = true;
    audio.volume = 0;

    audioRef.current = audio;

    const startMusic = async () => {
      if (startedRef.current) return;

      startedRef.current = true;

      try {
        await audio.play();

        // Soft fade-in
        let volume = 0;
        const targetVolume = 0.1;

        const fadeInterval = setInterval(() => {
          volume += 0.01;

          if (volume >= targetVolume) {
            volume = targetVolume;
            clearInterval(fadeInterval);
          }

          audio.volume = volume;
        }, 100);
      } catch (error) {
        startedRef.current = false;
        console.error("Music playback failed:", error);
      }
    };

    window.addEventListener("click", startMusic, { once: true });

    return () => {
      window.removeEventListener("click", startMusic);
      audio.pause();
      audio.src = "";
    };
  }, []);

  return null;
}
