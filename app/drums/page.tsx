'use client';

import { useCamera } from '@/src/hooks/useCamera';
import { useHandTracking } from '@/src/hooks/useHandTracking';
import { useEffect, useRef } from 'react';
import styles from './page.module.css';

export default function DrumsPage() {
  const { stream, error, isRequesting, requestCamera, stopCamera } =
    useCamera();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const { landmarks, isProcessing: _isProcessing, error: trackingError } = useHandTracking(
    videoRef,
    canvasRef,
    !!stream
  );

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
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
          <div className={styles.videoWrapper}>
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
          <button onClick={stopCamera} className={styles.stopButton}>
            Stop Camera
          </button>
        </div>
      )}
    </main>
  );
}
