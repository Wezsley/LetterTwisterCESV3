import { useRef, useCallback, useState } from "react";

interface SoundEffects {
  playSuccess: () => void;
  playError: () => void;
  playClick: () => void;
  playGameStart: () => void;
  playAchievement: () => void;
  playHover: () => void;
  playNavigation: () => void;
}

// Web Audio API sound generation for cross-platform compatibility
class SoundGenerator {
  private audioContext: AudioContext | null = null;
  private isEnabled = true;

  constructor() {
    // Initialize Web Audio API
    if (typeof window !== 'undefined') {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.log('Web Audio API not supported');
      }
    }
  }

  private async resumeAudioContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  // Success sound - ascending pleasant tone
  async playSuccess() {
    if (!this.isEnabled || !this.audioContext) return;
    
    await this.resumeAudioContext();
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    // Pleasant success melody
    oscillator.frequency.setValueAtTime(523, this.audioContext.currentTime); // C5
    oscillator.frequency.setValueAtTime(659, this.audioContext.currentTime + 0.1); // E5
    oscillator.frequency.setValueAtTime(784, this.audioContext.currentTime + 0.2); // G5
    
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.5);
  }

  // Error sound - gentle descending tone
  async playError() {
    if (!this.isEnabled || !this.audioContext) return;
    
    await this.resumeAudioContext();
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    // Gentle error sound (not harsh)
    oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
    oscillator.frequency.setValueAtTime(350, this.audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime + 0.2);
    
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.3);
  }

  // Click sound - short pleasant pop
  async playClick() {
    if (!this.isEnabled || !this.audioContext) return;
    
    await this.resumeAudioContext();
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.1);
  }

  // Game start sound - exciting ascending scale
  async playGameStart() {
    if (!this.isEnabled || !this.audioContext) return;
    
    await this.resumeAudioContext();
    
    const frequencies = [262, 294, 330, 349, 392, 440, 494, 523]; // C major scale
    
    frequencies.forEach((freq, index) => {
      const oscillator = this.audioContext!.createOscillator();
      const gainNode = this.audioContext!.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext!.destination);
      
      oscillator.frequency.setValueAtTime(freq, this.audioContext!.currentTime + index * 0.05);
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.03, this.audioContext!.currentTime + index * 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext!.currentTime + index * 0.05 + 0.1);
      
      oscillator.start(this.audioContext!.currentTime + index * 0.05);
      oscillator.stop(this.audioContext!.currentTime + index * 0.05 + 0.1);
    });
  }

  // Achievement sound - triumphant chord
  async playAchievement() {
    if (!this.isEnabled || !this.audioContext) return;
    
    await this.resumeAudioContext();
    
    // Play a major chord
    const frequencies = [523, 659, 784]; // C major chord
    
    frequencies.forEach(freq => {
      const oscillator = this.audioContext!.createOscillator();
      const gainNode = this.audioContext!.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext!.destination);
      
      oscillator.frequency.setValueAtTime(freq, this.audioContext!.currentTime);
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.04, this.audioContext!.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext!.currentTime + 0.8);
      
      oscillator.start(this.audioContext!.currentTime);
      oscillator.stop(this.audioContext!.currentTime + 0.8);
    });
  }

  // Hover sound - gentle ping
  async playHover() {
    if (!this.isEnabled || !this.audioContext) return;
    
    await this.resumeAudioContext();
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime);
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.02, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.05);
  }

  // Navigation sound - gentle swish
  async playNavigation() {
    if (!this.isEnabled || !this.audioContext) return;
    
    await this.resumeAudioContext();
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
    oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime + 0.1);
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.03, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.2);
  }
}

// Create global sound generator instance
let globalSoundGenerator: SoundGenerator | null = null;

// Hook for using sound effects
export function useSoundEffects(): SoundEffects {
  const soundGeneratorRef = useRef<SoundGenerator | null>(null);

  // Initialize sound generator
  if (!soundGeneratorRef.current && typeof window !== 'undefined') {
    if (!globalSoundGenerator) {
      globalSoundGenerator = new SoundGenerator();
    }
    soundGeneratorRef.current = globalSoundGenerator;
  }

  const playSuccess = useCallback(() => {
    soundGeneratorRef.current?.playSuccess();
  }, []);

  const playError = useCallback(() => {
    soundGeneratorRef.current?.playError();
  }, []);

  const playClick = useCallback(() => {
    soundGeneratorRef.current?.playClick();
  }, []);

  const playGameStart = useCallback(() => {
    soundGeneratorRef.current?.playGameStart();
  }, []);

  const playAchievement = useCallback(() => {
    soundGeneratorRef.current?.playAchievement();
  }, []);

  const playHover = useCallback(() => {
    soundGeneratorRef.current?.playHover();
  }, []);

  const playNavigation = useCallback(() => {
    soundGeneratorRef.current?.playNavigation();
  }, []);

  return {
    playSuccess,
    playError,
    playClick,
    playGameStart,
    playAchievement,
    playHover,
    playNavigation,
  };
}

// Sound control component
export function SoundControl() {
  const [isEnabled, setIsEnabled] = useState(true);

  const toggleSound = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    if (globalSoundGenerator) {
      globalSoundGenerator.setEnabled(newState);
    }
  };

  return (
    <button
      onClick={toggleSound}
      className="fixed bottom-4 left-4 z-50 bg-white hover:bg-gray-50 border-2 border-gray-300 rounded-full p-2 shadow-lg transition-all"
      title={isEnabled ? 'Disable Sound Effects' : 'Enable Sound Effects'}
    >
      {isEnabled ? (
        <div className="w-6 h-6 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-gray-600">
            <path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
        </div>
      ) : (
        <div className="w-6 h-6 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-gray-400">
            <path fill="currentColor" d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
          </svg>
        </div>
      )}
    </button>
  );
}

export default useSoundEffects;
