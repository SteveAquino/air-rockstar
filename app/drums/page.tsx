'use client';

import Link from 'next/link';
import { useCamera } from '@/src/hooks/useCamera';
import { useHandTracking } from '@/src/hooks/useHandTracking';
import { useDrumKit, type DrumKitVariant } from '@/src/hooks/useDrumKit';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { Panel } from '@/src/components/ui/Panel';
import { SegmentedControl } from '@/src/components/ui/SegmentedControl';
import { Slider } from '@/src/components/ui/Slider';
import { StatusPill } from '@/src/components/ui/StatusPill';
import { useEffect, useRef, useState } from 'react';
import styles from './page.module.css';

export default function DrumsPage() {
  const { stream, error, isRequesting, requestCamera, stopCamera } =
    useCamera();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [variant, setVariant] = useState<DrumKitVariant>('synth');
  const [sensitivity, setSensitivity] = useState(70);
  const [padSize, setPadSize] = useState(48);

  const {
    landmarks,
    isProcessing: _isProcessing,
    error: trackingError,
  } = useHandTracking(videoRef, canvasRef, !!stream);

  const { pads, activePads, isReady } = useDrumKit(
    landmarks,
    containerSize.width,
    containerSize.height,
    variant
  );

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

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
      window.addEventListener('resize', updateSize);

      return () => {
        video.removeEventListener('loadedmetadata', updateSize);
        window.removeEventListener('resize', updateSize);
      };
    }
  }, [stream]);

  const handsDetected = landmarks ? landmarks.length : 0;

  return (
    <main className={styles.main}>
      <header className={styles.topBar}>
        <Link href="/" className={styles.backLink}>
          Back
        </Link>
        <StatusPill tone="info" label="Air Drums" />
        <div className={styles.statusGroup}>
          <StatusPill
            tone={handsDetected > 0 ? 'ready' : 'warn'}
            label={handsDetected > 0 ? 'Hands Detected' : 'Hands Missing'}
          />
          <StatusPill
            tone={isReady ? 'ready' : 'warn'}
            label={isReady ? 'Audio Ready' : 'Audio Loading'}
          />
        </div>
      </header>

      {!stream && (
        <Card className={styles.setupCard}>
          <h1 className={styles.title}>Air Drums</h1>
          <p className={styles.description}>
            Enable your camera to start tracking your hand movements.
          </p>
          <Button
            onClick={requestCamera}
            disabled={isRequesting}
            aria-label="Enable camera for hand tracking"
          >
            {isRequesting ? 'Initializing...' : 'Enable Camera'}
          </Button>
        </Card>
      )}

      {error && (
        <div role="alert" className={styles.error}>
          {error}
        </div>
      )}

      {stream && (
        <section className={styles.content}>
          <div className={styles.videoColumn}>
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
              {isReady &&
                pads.map((pad) => (
                  <div
                    key={pad.id}
                    className={styles.drumPad}
                    style={{
                      left: `${pad.x}%`,
                      top: `${pad.y}%`,
                      width: `${pad.width}px`,
                      height: `${pad.height}px`,
                      backgroundColor: activePads.has(pad.id)
                        ? pad.activeColor
                        : pad.color,
                      transform: activePads.has(pad.id)
                        ? 'scale(1.08)'
                        : 'scale(1)',
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
          </div>

          <Panel className={styles.controlPanel}>
            <div className={styles.statsRow}>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Combo</span>
                <span className={styles.statValue}>4</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Tempo</span>
                <span className={styles.statValue}>120 BPM</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Hits</span>
                <span className={styles.statValue}>15</span>
              </div>
            </div>

            <div className={styles.sliderGroup}>
              <Slider
                label="Sensitivity"
                value={sensitivity}
                min={0}
                max={100}
                unit="%"
                onChange={setSensitivity}
              />
              <Slider
                label="Size"
                value={padSize}
                min={20}
                max={90}
                unit="%"
                onChange={setPadSize}
              />
            </div>

            <SegmentedControl
              label="Sound Variant"
              value={variant}
              onChange={(value) => setVariant(value as DrumKitVariant)}
              options={[
                { value: 'synth', label: 'Synth' },
                { value: 'acoustic', label: 'Acoustic' },
              ]}
            />

            <div className={styles.actionRow}>
              <Button variant="ghost" size="sm">
                Performance Mode
              </Button>
              <Button variant="danger" size="sm" onClick={stopCamera}>
                Stop Camera
              </Button>
            </div>
          </Panel>
        </section>
      )}
    </main>
  );
}
