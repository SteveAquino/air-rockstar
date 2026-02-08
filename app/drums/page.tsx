'use client';

import { useCamera } from '@/src/hooks/useCamera';
import { useHandTracking } from '@/src/hooks/useHandTracking';
import { useDrumKit, type DrumKitVariant } from '@/src/hooks/useDrumKit';
import { Panel } from '@/src/components/ui/Panel';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DrumsHeader } from './DrumsHeader';
import { DrumsSetupCard } from './DrumsSetupCard';
import { DrumsVideoStage } from './DrumsVideoStage';
import { DrumsStats } from './DrumsStats';
import { DrumsControls } from './DrumsControls';
import { DrumsActions } from './DrumsActions';
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

  const tempoLabel = tempo ? `${tempo} BPM` : '--';

  return (
    <main className={styles.main}>
      <DrumsHeader handsDetected={handsDetected} isReady={isReady} />

      {!stream && (
        <DrumsSetupCard
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
            <DrumsVideoStage
              videoRef={videoRef}
              canvasRef={canvasRef}
              containerRef={containerRef}
              pads={pads}
              activePads={activePads}
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
                <DrumsStats combo={combo} tempoLabel={tempoLabel} hits={hits} />
                <DrumsControls
                  sensitivity={sensitivity}
                  padSize={padSize}
                  volume={volume}
                  variant={variant}
                  onSensitivityChange={setSensitivity}
                  onPadSizeChange={setPadSize}
                  onVolumeChange={setVolume}
                  onVariantChange={setVariant}
                />
              </>
            )}

            <DrumsActions
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
