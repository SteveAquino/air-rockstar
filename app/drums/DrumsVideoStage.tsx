import { Button } from '@/src/components/ui/Button';
import type { DrumsVideoStageProps } from './types';
import styles from './page.module.css';

export function DrumsVideoStage({
  videoRef,
  canvasRef,
  containerRef,
  pads,
  activePads,
  isReady,
  isFullScreen,
  onExitFullScreen,
  onStopCamera,
}: DrumsVideoStageProps) {
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
              transform: activePads.has(pad.id) ? 'scale(1.08)' : 'scale(1)',
            }}
          >
            <span className={styles.drumLabel}>{pad.name}</span>
          </div>
        ))}
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
