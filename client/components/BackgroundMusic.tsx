import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";

export default function BackgroundMusic() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Set up audio properties
    audio.loop = true;
    audio.volume = 0.3; // Set to 30% volume to not be too loud
    audio.preload = "auto";

    // Try to autoplay (will work after user interaction)
    const attemptAutoplay = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        // Autoplay failed, user needs to interact first
        console.log("Autoplay prevented - waiting for user interaction");
      }
    };

    // Handle audio events
    const handleCanPlay = () => {
      attemptAutoplay();
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleError = (e: Event) => {
      console.log("Audio error:", e);
    };

    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    // Start playing on first user interaction
    const enableAudioOnInteraction = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
        // Remove listeners after first successful play
        document.removeEventListener('click', enableAudioOnInteraction);
        document.removeEventListener('touchstart', enableAudioOnInteraction);
        document.removeEventListener('keydown', enableAudioOnInteraction);
      } catch (error) {
        console.log("Audio play failed:", error);
      }
    };

    // Add event listeners for user interaction
    document.addEventListener('click', enableAudioOnInteraction);
    document.addEventListener('touchstart', enableAudioOnInteraction);
    document.addEventListener('keydown', enableAudioOnInteraction);

    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
      document.removeEventListener('click', enableAudioOnInteraction);
      document.removeEventListener('touchstart', enableAudioOnInteraction);
      document.removeEventListener('keydown', enableAudioOnInteraction);
    };
  }, []);

  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
      } else {
        await audio.play();
      }
    } catch (error) {
      console.log("Toggle play/pause failed:", error);
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = !audio.muted;
    setIsMuted(!isMuted);
  };

  return (
    <>
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src="https://cdn.builder.io/o/assets%2F5a267f4263554fcdaf73c870cff110db%2Ff88dcce72e6a427f85ccfe39176318ca?alt=media&token=ddc71b62-a2c8-4b77-b784-920aa5d03993&apiKey=5a267f4263554fcdaf73c870cff110db"
        crossOrigin="anonymous"
      />

      {/* Floating music controls */}
      <div className="fixed bottom-4 right-4 z-50 flex gap-2">
        <Button
          onClick={togglePlayPause}
          size="sm"
          className={`rounded-full shadow-lg ${
            isPlaying 
              ? 'bg-green-500 hover:bg-green-600' 
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white`}
          title={isPlaying ? 'Pause Music' : 'Play Music'}
        >
          {isPlaying ? (
            <div className="w-4 h-4 flex items-center justify-center">
              <div className="flex gap-0.5">
                <div className="w-1 h-3 bg-white rounded"></div>
                <div className="w-1 h-3 bg-white rounded"></div>
              </div>
            </div>
          ) : (
            <div className="w-4 h-4 flex items-center justify-center">
              <div className="w-0 h-0 border-l-[6px] border-l-white border-y-[4px] border-y-transparent ml-0.5"></div>
            </div>
          )}
        </Button>

        <Button
          onClick={toggleMute}
          size="sm"
          variant="outline"
          className="rounded-full shadow-lg bg-white hover:bg-gray-50"
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-gray-600" />
          ) : (
            <Volume2 className="w-4 h-4 text-gray-600" />
          )}
        </Button>
      </div>
    </>
  );
}
