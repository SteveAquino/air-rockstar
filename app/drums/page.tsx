'use client';

import Link from 'next/link';
import { useCamera } from '@/src/hooks/useCamera';
import { useHandTracking } from '@/src/hooks/useHandTracking';
import { useDrumKit, type DrumKitVariant } from '@/src/hooks/useDrumKit';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { HelpTooltip } from '@/src/components/ui/HelpTooltip';
import { Panel } from '@/src/components/ui/Panel';
import { SegmentedControl } from '@/src/components/ui/SegmentedControl';
import { Slider } from '@/src/components/ui/Slider';
import { StatusPill } from '@/src/components/ui/StatusPill';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  const [volume, setVolume] = useState(70);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [hits, setHits] = useState(0);
  const [combo, setCombo] = useState(0);
  const [hitTimestamps, setHitTimestamps] = useState<number[]>([]);
  const lastHitAtRef = useRef<number | null>(null);
  const comboTimeoutRef = useRef<number | null>(null);

  const padScale = useMemo(() => 0.6 + ((padSize - 20) / 70) * 1.0, [padSize]);
  const hitPadding = useMemo(
    () => 4 + (sensitivity / 100) * 40,
    [sensitivity]
  );
  const volumeScale = useMemo(() => volume / 100, [volume]);
  const landmarkRadius = useMemo(
    () => 3 + (sensitivity / 100) * 4,
    [sensitivity]
  );

  const handleHit = useCallback((_padId: string) => {
    const now = Date.now();
    setHits((prev) => prev + 1);

    setHitTimestamps((prev) => {
      const next = [...prev, now];
      return next.slice(-6);
    });

    setCombo((prev) => {
      const lastHitAt = lastHitAtRef.current;
      if (lastHitAt && now - lastHitAt <= 1200) {
        return prev + 1;
      }
      return 1;
    });

    lastHitAtRef.current = now;

    if (comboTimeoutRef.current) {
      window.clearTimeout(comboTimeoutRef.current);
    }
    comboTimeoutRef.current = window.setTimeout(() => {
      setCombo(0);
    }, 1200);
  }, []);

  const {
    landmarks,
    isProcessing: _isProcessing,
    error: trackingError,
  } = useHandTracking(videoRef, canvasRef, !!stream, {
    landmarkRadius,
    landmarkColor: 'rgba(138, 240, 217, 0.95)',
    connectionColor: 'rgba(245, 242, 255, 0.35)',
    connectionWidth: 2,
  });

  const { pads, activePads, isReady } = useDrumKit(
    landmarks,
    containerSize.width,
    containerSize.height,
    variant,
    { padScale, hitPadding, volume: volumeScale, onHit: handleHit }
  );

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    document.addEventListener(
      'webkitfullscreenchange',
      handleFullScreenChange as EventListener
    );

    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      document.removeEventListener(
        'webkitfullscreenchange',
        handleFullScreenChange as EventListener
      );
    };
  }, []);

  const toggleFullScreen = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;

    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    const request = container.requestFullscreen
      ? container.requestFullscreen.bind(container)
      : (container as HTMLElement & { webkitRequestFullscreen?: () => void })
          .webkitRequestFullscreen;

    if (request) {
      await request();
    } else {
      setIsFullScreen((prev) => !prev);
    }
  }, []);

  const handleStopCamera = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    stopCamera();
  }, [stopCamera]);

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

  useEffect(() => {
    return () => {
      if (comboTimeoutRef.current) {
        window.clearTimeout(comboTimeoutRef.current);
      }
    };
  }, []);

  const handsDetected = landmarks ? landmarks.length : 0;
  const tempo = useMemo(() => {
    if (hitTimestamps.length < 2) {
      return null;
    }
    const intervals = hitTimestamps
      .slice(1)
      .map((time, index) => time - hitTimestamps[index]);
    const avgInterval =
      intervals.reduce((total, value) => total + value, 0) / intervals.length;
    if (!avgInterval) {
      return null;
    }
    return Math.round(60000 / avgInterval);
  }, [hitTimestamps]);

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
              {isFullScreen && (
                <div className={styles.fullscreenControls}>
                  <Button
                    variant="subtle"
                    size="sm"
                    onClick={toggleFullScreen}
                  >
                    Exit Full Screen
                  </Button>
                  <Button variant="danger" size="sm" onClick={handleStopCamera}>
                    Stop Camera
                  </Button>
                </div>
              )}
            </div>

            {trackingError && (
              <div className={styles.trackingError}>
                Hand tracking: {trackingError}
              </div>
            )}
          </div>

          <Panel className={styles.controlPanel}>
            {!isFullScreen && (
              <>
                <div className={styles.statsRow}>
                  <div className={styles.stat}>
                    <div className={styles.statHeader}>
                      <span className={styles.statLabel}>Combo</span>
                      <HelpTooltip
                        label="Help: Combo"
                        text="Your current streak of quick hits."
                      />
                    </div>
                    <span className={styles.statValue}>{combo}</span>
                  </div>
                  <div className={styles.stat}>
                    <div className={styles.statHeader}>
                      <span className={styles.statLabel}>Tempo</span>
                      <HelpTooltip
                        label="Help: Tempo"
                        text="Estimated speed of your recent hits."
                      />
                    </div>
                    <span className={styles.statValue}>
                      {tempo ? `${tempo} BPM` : '--'}
                    </span>
                  </div>
                  <div className={styles.stat}>
                    <div className={styles.statHeader}>
                      <span className={styles.statLabel}>Hits</span>
                      <HelpTooltip
                        label="Help: Hits"
                        text="Total hits this session."
                      />
                    </div>
                    <span className={styles.statValue}>{hits}</span>
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
                    helpText="Makes hit detection more forgiving when your hands are a little off."
                  />
                  <Slider
                    label="Size"
                    value={padSize}
                    min={20}
                    max={90}
                    unit="%"
                    onChange={setPadSize}
                    helpText="Changes how large the drum pads appear and how easy they are to reach."
                  />
                  <Slider
                    label="Volume"
                    value={volume}
                    min={0}
                    max={100}
                    unit="%"
                    onChange={setVolume}
                    helpText="Controls how loud the drum hits sound."
                  />
                </div>

                <SegmentedControl
                  label="Sound Variant"
                  value={variant}
                  helpText="Switch between electronic and acoustic drum sounds."
                  onChange={(value) => setVariant(value as DrumKitVariant)}
                  options={[
                    { value: 'synth', label: 'Synth' },
                    { value: 'acoustic', label: 'Acoustic' },
                  ]}
                />
              </>
            )}

            <div className={styles.actionRow}>
              <div className={styles.actionItem}>
                <Button
                  variant={isFullScreen ? 'subtle' : 'ghost'}
                  size="sm"
                  aria-pressed={isFullScreen}
                  onClick={toggleFullScreen}
                >
                  {isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
                </Button>
                <HelpTooltip
                  label="Help: Full Screen"
                  text="Expand the drum view to fill your screen. Press again to exit."
                />
              </div>
              <div className={styles.actionItem}>
                <Button variant="danger" size="sm" onClick={handleStopCamera}>
                  Stop Camera
                </Button>
                <HelpTooltip
                  label="Help: Stop Camera"
                  text="Turn off the camera and stop tracking."
                />
              </div>
            </div>
          </Panel>
        </section>
      )}
    </main>
  );
}
