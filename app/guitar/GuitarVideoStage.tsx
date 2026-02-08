import { Button } from '@/src/components/ui/Button';
import type { GuitarVideoStageProps } from './types';
import styles from './page.module.css';

export function GuitarVideoStage({
  videoRef,
  canvasRef,
  containerRef,
  strings,
  activeStrings,
  frettedStrings,
  fretZoneWidthRatio,
  strumZoneWidthRatio,
  fretCount,
  isReady,
  isFullScreen,
  onExitFullScreen,
  onStopCamera,
}: GuitarVideoStageProps) {
  const clampedFretZone = Math.min(Math.max(fretZoneWidthRatio, 0), 0.9);
  const clampedStrumZone = Math.min(Math.max(strumZoneWidthRatio, 0), 0.9);

  return (
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
      {isReady && (
        <div className={styles.zoneOverlay} aria-hidden="true">
          <div
            className={styles.fretZone}
            style={{ width: `${clampedFretZone * 100}%` }}
          >
            <span className={styles.zoneLabel}>Fret</span>
          </div>
          <div
            className={styles.strumZone}
            style={{ width: `${clampedStrumZone * 100}%` }}
          >
            <span className={styles.zoneLabel}>Strum</span>
          </div>
          <div
            className={styles.zoneDivider}
            style={{ left: `${clampedFretZone * 100}%` }}
          />
          <div
            className={styles.zoneDivider}
            style={{ right: `${clampedStrumZone * 100}%` }}
          />
        </div>
      )}
      {isReady && (
        <div className={styles.stringOverlay} role="list" aria-label="Guitar strings">
          {strings.map((string) => {
            const isActive = activeStrings.has(string.id);
            const fret = frettedStrings[string.id] ?? 0;
            const hasFret = fret > 0;
            const safeFretCount = Math.max(fretCount, 1);
            const fretWidthPercent = 100 / safeFretCount;
            const fretHighlightLeft = (fret - 1) * fretWidthPercent;
            const fretDotLeft = (fret - 0.5) * fretWidthPercent;
            return (
              <div
                key={string.id}
                className={styles.stringBand}
                role="listitem"
                aria-label={`String ${string.note}`}
                style={{
                  top: `${string.yPercent}%`,
                  height: `${string.thicknessPx}px`,
                  backgroundColor: isActive ? string.activeColor : string.color,
                  boxShadow: isActive
                    ? '0 0 20px rgba(255, 255, 255, 0.5)'
                    : '0 0 12px rgba(255, 255, 255, 0.2)',
                }}
              >
                <div
                  className={styles.fretTrack}
                  style={{ width: `${clampedFretZone * 100}%` }}
                  aria-label={`Fret track ${string.note}`}
                  role="group"
                >
                  {Array.from({ length: Math.max(safeFretCount - 1, 0) }).map(
                    (_, index) => (
                      <span
                        key={`${string.id}-fret-${index + 1}`}
                        className={styles.fretLine}
                        style={{ left: `${(index + 1) * fretWidthPercent}%` }}
                        aria-hidden="true"
                      />
                    )
                  )}
                  {hasFret && (
                    <>
                      <span
                        className={styles.fretHighlight}
                        style={{
                          left: `${fretHighlightLeft}%`,
                          width: `${fretWidthPercent}%`,
                        }}
                        aria-hidden="true"
                      />
                      <span
                        className={styles.fretDot}
                        style={{ left: `${fretDotLeft}%` }}
                        aria-label={`Fret ${fret} active`}
                      />
                    </>
                  )}
                </div>
                <span className={styles.stringLabel}>{string.label}</span>
                <span
                  className={styles.fretBadge}
                  aria-label={`Fret ${fret}`}
                >
                  {fret}
                </span>
              </div>
            );
          })}
        </div>
      )}
      {isFullScreen && (
        <div className={styles.fullscreenControls}>
          <Button variant="subtle" size="sm" onClick={onExitFullScreen}>
            Exit Full Screen
          </Button>
          <Button variant="danger" size="sm" onClick={onStopCamera}>
            Stop Camera
          </Button>
        </div>
      )}
    </div>
  );
}
