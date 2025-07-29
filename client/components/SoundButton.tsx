import { forwardRef } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { useSoundEffects } from "@/components/SoundEffects";

interface SoundButtonProps extends ButtonProps {
  soundType?: 'click' | 'navigation' | 'success' | 'none';
  enableHoverSound?: boolean;
}

const SoundButton = forwardRef<HTMLButtonElement, SoundButtonProps>(
  ({ soundType = 'click', enableHoverSound = false, onClick, onMouseEnter, ...props }, ref) => {
    const sounds = useSoundEffects();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Play sound based on type
      switch (soundType) {
        case 'click':
          sounds.playClick();
          break;
        case 'navigation':
          sounds.playNavigation();
          break;
        case 'success':
          sounds.playSuccess();
          break;
        case 'none':
          // No sound
          break;
      }

      // Call original onClick handler
      if (onClick) {
        onClick(e);
      }
    };

    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (enableHoverSound) {
        sounds.playHover();
      }

      // Call original onMouseEnter handler
      if (onMouseEnter) {
        onMouseEnter(e);
      }
    };

    return (
      <Button
        ref={ref}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        {...props}
      />
    );
  }
);

SoundButton.displayName = "SoundButton";

export { SoundButton };
export default SoundButton;
