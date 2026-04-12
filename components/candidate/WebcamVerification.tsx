'use client';

import { useEffect } from 'react';
import { Camera, CameraOff, ShieldCheck } from 'lucide-react';
import { useWebcam } from '@/hooks/useWebcam';
import { GlowCard } from '@/components/ui/GlowCard';

interface WebcamVerificationProps {
  onReady?: () => void;
  compact?: boolean;
}

export function WebcamVerification({
  onReady,
  compact = false,
}: WebcamVerificationProps) {
  const { videoRef, isActive, error, startWebcam, stopWebcam } = useWebcam();

  useEffect(() => {
    if (isActive && onReady) onReady();
  }, [isActive, onReady]);

  useEffect(() => {
    return () => stopWebcam();
  }, [stopWebcam]);

  return (
    <GlowCard glowColor="cyan" className="overflow-hidden">
      <div
        className={`relative ${compact ? 'aspect-[4/3]' : 'aspect-video'} bg-nt-bg`}
      >
        {/* Live video */}
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            isActive ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ transform: 'scaleX(-1)' }}
        />

        {/* Inactive placeholder */}
        {!isActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-nt-bg">
            <div className="w-12 h-12 rounded-xl bg-gray-800/60 border border-gray-700/50 flex items-center justify-center">
              <CameraOff size={20} className="text-gray-600" />
            </div>
            <p className="text-gray-600 text-sm font-mono">Camera inactive</p>
          </div>
        )}

        {/* Scan line overlay when active */}
        {isActive && (
          <>
            <div className="absolute inset-0 pointer-events-none">
              {/* Corner brackets */}
              {[
                'top-2 left-2',
                'top-2 right-2',
                'bottom-2 left-2',
                'bottom-2 right-2',
              ].map((pos, i) => (
                <div key={i} className={`absolute ${pos} w-6 h-6`}>
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d={
                        i === 0
                          ? 'M0 12 L0 0 L12 0'
                          : i === 1
                            ? 'M24 12 L24 0 L12 0'
                            : i === 2
                              ? 'M0 12 L0 24 L12 24'
                              : 'M24 12 L24 24 L12 24'
                      }
                      stroke="#00f5d4"
                      strokeWidth="1.5"
                    />
                  </svg>
                </div>
              ))}
            </div>
            {/* Verified badge */}
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-full px-2.5 py-1 border border-nt-cyan/30">
              <ShieldCheck size={12} className="text-nt-cyan" />
              <span className="text-nt-cyan text-xs font-mono">
                LIVE VERIFIED
              </span>
            </div>
          </>
        )}

        {/* Error overlay */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-900/20 backdrop-blur-sm">
            <div className="text-center p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Camera control */}
      <div className="p-3 border-t border-nt-border flex items-center justify-between">
        <span className="text-xs font-mono text-gray-600">
          {isActive ? 'IDENTITY VERIFICATION ACTIVE' : 'CAMERA REQUIRED'}
        </span>
        <button
          onClick={isActive ? stopWebcam : startWebcam}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
            isActive
              ? 'bg-red-900/30 text-red-400 border border-red-700/30 hover:bg-red-900/50'
              : 'bg-nt-cyan/10 text-nt-cyan border border-nt-cyan/30 hover:bg-nt-cyan/20'
          }`}
        >
          {isActive ? <CameraOff size={12} /> : <Camera size={12} />}
          {isActive ? 'Stop' : 'Enable Camera'}
        </button>
      </div>
    </GlowCard>
  );
}
