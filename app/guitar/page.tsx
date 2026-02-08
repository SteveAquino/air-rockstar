'use client';

import { useCamera } from '@/src/hooks/useCamera';
import { useHandTracking } from '@/src/hooks/useHandTracking';
import { useGuitar } from '@/src/hooks/useGuitar';
import { Panel } from '@/src/components/ui/Panel';
import { CameraSetupCard } from '@/src/components/ui/CameraSetupCard';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GuitarHeader } from './GuitarHeader';
import { GuitarVideoStage } from './GuitarVideoStage';
import { GuitarStats } from './GuitarStats';
import { GuitarControls } from './GuitarControls';
import { GuitarActions } from './GuitarActions';
import styles from './page.module.css';

export default function GuitarPage() {
  const { stream, error, isRequesting, requestCamera, stopCamera } =
    useCamera();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [sensitivity, setSensitivity] = useState(50);
  const [spacing, setSpacing] = useState(60);
  const [position, setPosition] = useState(33);
  const [volume, setVolume] = useState(70);
  const [fretCount, setFretCount] = useState(20);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [hits, setHits] = useState(0);
  const [combo, setCombo] = useState(0);
  const [hitTimestamps, setHitTimestamps] = useState<number[]>([]);
  const lastHitAtRef = useRef<number | null>(null);
  const comboTimeoutRef = useRef<number | null>(null);

  const spacingScale = useMemo(
    () => 0.2 + (spacing / 100) * 0.14,
    [spacing]
  );
  const hitPadding = useMemo(
    () => 2 + (sensitivity / 100) * 18,
    [sensitivity]
  );
  const stringThickness = useMemo(
    () => 10 + (sensitivity / 100) * 6,
    [sensitivity]
  );
  const verticalOffset = useMemo(
    () => ((50 - position) / 50) * 0.2,
    [position]
  );
  const volumeScale = useMemo(() => volume / 100, [volume]);
  const landmarkRadius = useMemo(
    () => 3 + (sensitivity / 100) * 4,
    [sensitivity]
  );

  const handleHit = useCallback((_stringId: string) => {
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
    landmarkColor: 'rgba(255, 233, 153, 0.95)',
    connectionColor: 'rgba(245, 242, 255, 0.35)',
    connectionWidth: 2,
  });

  const fretZoneWidthRatio = 0.67;
  const strumZoneWidthRatio = 0.33;

  const { strings, activeStrings, frettedStrings, isReady } = useGuitar(
    landmarks,
    containerSize.width,
    containerSize.height,
    {
      stringSpacing: spacingScale,
      stringVerticalOffset: verticalOffset,
      hitPadding,
      stringThickness,
      volume: volumeScale,
      cooldownMs: 200,
      fretCount,
      fretZoneWidthRatio,
      strumZoneWidthRatio,
      onHit: handleHit,
    }
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

  const tempoLabel = tempo ? `${tempo} BPM` : '--';

  return (
    <main className={styles.main}>
      <GuitarHeader handsDetected={handsDetected} isReady={isReady} />

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
          <div className={styles.videoColumn}>
            <GuitarVideoStage
              videoRef={videoRef}
              canvasRef={canvasRef}
              containerRef={containerRef}
              strings={strings}
              activeStrings={activeStrings}
              frettedStrings={frettedStrings}
              fretZoneWidthRatio={fretZoneWidthRatio}
              strumZoneWidthRatio={strumZoneWidthRatio}
              fretCount={fretCount}
              isReady={isReady}
              isFullScreen={isFullScreen}
              onExitFullScreen={toggleFullScreen}
              onStopCamera={handleStopCamera}
            />

            {trackingError && (
              <div className={styles.trackingError}>
                Hand tracking: {trackingError}
              </div>
            )}
          </div>

          <Panel className={styles.controlPanel}>
            {!isFullScreen && (
              <>
                <GuitarStats
                  combo={combo}
                  tempoLabel={tempoLabel}
                  hits={hits}
                />
                <GuitarControls
                  sensitivity={sensitivity}
                  spacing={spacing}
                  position={position}
                  volume={volume}
                  fretCount={fretCount}
                  onSensitivityChange={setSensitivity}
                  onSpacingChange={setSpacing}
                  onPositionChange={setPosition}
                  onVolumeChange={setVolume}
                  onFretCountChange={setFretCount}
                />
              </>
            )}

            <GuitarActions
              isFullScreen={isFullScreen}
              onToggleFullScreen={toggleFullScreen}
              onStopCamera={handleStopCamera}
            />
          </Panel>
        </section>
      )}
    </main>
  );
}
