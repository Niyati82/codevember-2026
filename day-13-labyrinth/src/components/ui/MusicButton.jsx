import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";

function MusicButton() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = new Audio("/ambient.mp3");
    audio.loop = true;
    audio.volume = 0.4;

    audioRef.current = audio;

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  const toggleMusic = async () => {
    const audio = audioRef.current;

    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        console.log("Audio playback failed:", error);
      }
    }
  };

  return (
    <button
      onClick={toggleMusic}
      title={isPlaying ? "Turn off music" : "Turn on music"}
      style={{
        position: "fixed",
        bottom: "3vh",
        left: "2vw",
        zIndex: 10000,
        width: "50px",
        height: "50px",
        background: "rgba(10, 10, 10, 0.8)",
        border: "1px solid #fbfbfb",
        borderRadius: "50%",
        color: "#fbfbfb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
      }}
    >
      {isPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
    </button>
  );
}

export default MusicButton;
