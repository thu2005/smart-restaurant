import React, { useEffect, useRef } from "react";

const SoundNotification = ({ enabled, trigger }) => {
  const audioContextRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    const playNotificationSound = () => {
      try {
        if (!audioContextRef?.current) {
          audioContextRef.current = new (window.AudioContext ||
            window.webkitAudioContext)();
        }

        const context = audioContextRef?.current;
        const oscillator = context?.createOscillator();
        const gainNode = context?.createGain();

        oscillator?.connect(gainNode);
        gainNode?.connect(context?.destination);

        oscillator.frequency.value = 800;
        oscillator.type = "sine";

        gainNode?.gain?.setValueAtTime(0.3, context?.currentTime);
        gainNode?.gain?.exponentialRampToValueAtTime(
          0.01,
          context?.currentTime + 0.5
        );

        oscillator?.start(context?.currentTime);
        oscillator?.stop(context?.currentTime + 0.5);
      } catch (error) {
        console.error("Sound notification error:", error);
      }
    };

    if (trigger > 0) {
      playNotificationSound();
    }
  }, [enabled, trigger]);

  return null;
};

export default SoundNotification;
