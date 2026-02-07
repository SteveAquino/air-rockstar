'use client';

import { useCamera } from '@/src/hooks/useCamera';
import { useHandTracking } from '@/src/hooks/useHandTracking';
import { useDrumKit } from '@/src/hooks/useDrumKit';
import { useEffect, useRef, useState } from 'react';
import styles from './page.module.css';

export default function DrumsPage() {
  const { stream, error, isRequesting, requestCamera, stopCamera } =
    useCamera();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  
  const { landmarks, isProcessing: _isProcessing, error: trackingError } = useHandTracking(
    videoRef,
    canvasRef,
    !!stream
  );

  const { pads, activePads, isReady } = useDrumKit(
    landmarks,
    containerSize.width,
    containerSize.height
  );

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Update container size when video loads
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };

    const video = videoRef.current;
    if (video) {
      video.addEventListener('loadedmetadata', updateSize);
      // Also update on window resize
      window.addEventListener('resize', updateSize);
      
      return () => {
        video.removeEventListener('loadedmetadata', updateSize);
        window.removeEventListener('resize', updateSize);
      };
    }
  }, [stream]);

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>🥁 Air Drums</h1>

      {!stream && (
        <div className={styles.setupContainer}>
          <p className={styles.description}>
            Enable your camera to start tracking your hand movements
          </p>
          <button
            onClick={requestCamera}
            disabled={isRequesting}
            className={styles.enableButton}
            aria-label="Enable camera for hand tracking"
          >
            {isRequesting ? 'Initializing...' : 'Enable Camera'}
          </button>
        </div>
      )}

      {error && (
        <div role="alert" className={styles.error}>
          {error}
        </div>
      )}

      {stream && (
        <div className={styles.cameraContainer}>
          <div className={styles.videoWrapper} ref={containerRef}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={styles.video}
              aria-label="Camera feed showing your hands"
            />
            <canvas
              ref={canvasRef}
              className={styles.canvas}
              aria-label="Hand tracking overlay"
            />
            {/* Drum pads overlay */}
            {isReady && pads.map(pad => (
              <div
                key={pad.id}
                className={styles.drumPad}
                style={{
                  left: `${pad.x}%`,
                  top: `${pad.y}%`,
                  width: `${pad.width}px`,
                  height: `${pad.height}px`,
                  backgroundColor: activePads.has(pad.id) ? pad.activeColor : pad.color,
                  transform: activePads.has(pad.id) ? 'scale(1.1)' : 'scale(1)',
                }}
              >
                <span className={styles.drumLabel}>{pad.name}</span>
              </div>
            ))}
          </div>
          {trackingError && (
            <div className={styles.trackingError}>
              Hand tracking: {trackingError}
            </div>
          )}
          {landmarks && (
            <div className={styles.handCount}>
              {landmarks.length} hand{landmarks.length !== 1 ? 's' : ''} detected
            </div>
          )}
          {!isReady && (
            <div className={styles.audioLoading}>
              Loading drum sounds...
            </div>
          )}
          <button onClick={stopCamera} className={styles.stopButton}>
            Stop Camera
          </button>
        </div>
      )}
    </main>
  );
}
