import { Button } from '@/src/components/ui/Button';
import type { GuitarVideoStageProps } from './types';
import styles from './page.module.css';

export function GuitarVideoStage({
  videoRef,
  canvasRef,
  containerRef,
  strings,
  activeStrings,
  isReady,
  isFullScreen,
  onExitFullScreen,
  onStopCamera,
}: GuitarVideoStageProps) {
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
        <div className={styles.stringOverlay} role="list" aria-label="Guitar strings">
          {strings.map((string) => {
            const isActive = activeStrings.has(string.id);
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
                <span className={styles.stringLabel}>{string.label}</span>
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
