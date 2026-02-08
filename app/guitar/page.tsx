'use client';

import Link from 'next/link';
import { useCamera } from '@/src/hooks/useCamera';
import { useHandTracking } from '@/src/hooks/useHandTracking';
import { Button } from '@/src/components/ui/Button';
import { CameraSetupCard } from '@/src/components/ui/CameraSetupCard';
import { StatusPill } from '@/src/components/ui/StatusPill';
import { useEffect, useRef } from 'react';
import styles from './page.module.css';

export default function GuitarPage() {
  const { stream, error, isRequesting, requestCamera, stopCamera } =
    useCamera();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const {
    landmarks,
    isProcessing: _isProcessing,
    error: trackingError,
  } = useHandTracking(videoRef, canvasRef, !!stream);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const handsDetected = landmarks ? landmarks.length : 0;

  return (
    <main className={styles.main}>
      <header className={styles.topBar}>
        <Link href="/" className={styles.backLink}>
          Back
        </Link>
        <StatusPill tone="info" label="Air Guitar" />
        <StatusPill
          tone={handsDetected > 0 ? 'ready' : 'warn'}
          label={handsDetected > 0 ? 'Hands Detected' : 'Hands Missing'}
        />
      </header>

      {!stream && (
        <CameraSetupCard
          title="Air Guitar"
          isRequesting={isRequesting}
          onEnable={requestCamera}
        />
      )}

      {error && (
        <div role="alert" className={styles.error}>
          {error}
        </div>
      )}

      {stream && (
        <section className={styles.content}>
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
          <Button variant="danger" size="sm" onClick={stopCamera}>
            Stop Camera
          </Button>
        </section>
      )}
    </main>
  );
}
