'use client';

import { useCamera } from '@/src/hooks/useCamera';
import { useEffect, useRef } from 'react';
import styles from './page.module.css';

export default function DrumsPage() {
  const { stream, error, isRequesting, requestCamera, stopCamera } =
    useCamera();
  const videoRef = useRef<HTMLVideoElement>(null);

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
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={styles.video}
            aria-label="Camera feed showing your hands"
          />
          <button onClick={stopCamera} className={styles.stopButton}>
            Stop Camera
          </button>
        </div>
      )}
    </main>
  );
}
