'use client';

import { useState, useRef, useCallback } from 'react';

interface UseAudioPlayerReturn {
  isPlaying: boolean;
  playAudio: (audioData: ArrayBuffer | Blob) => Promise<void>;
  stopAudio: () => void;
}

export function useAudioPlayer(): UseAudioPlayerReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const playAudio = useCallback(
    async (audioData: ArrayBuffer | Blob) => {
      stopAudio();

      try {
        const blob =
          audioData instanceof Blob
            ? audioData
            : new Blob([audioData], { type: 'audio/mpeg' });

        const url = URL.createObjectURL(blob);
        urlRef.current = url;

        const audio = new Audio(url);
        audioRef.current = audio;

        audio.onended = () => {
          setIsPlaying(false);
          if (urlRef.current) {
            URL.revokeObjectURL(urlRef.current);
            urlRef.current = null;
          }
        };

        audio.onerror = () => {
          setIsPlaying(false);
        };

        setIsPlaying(true);
        await audio.play();
      } catch (err) {
        console.error('Audio playback error:', err);
        setIsPlaying(false);
      }
    },
    [stopAudio]
  );

  return { isPlaying, playAudio, stopAudio };
}
