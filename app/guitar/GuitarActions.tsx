import { Button } from '@/src/components/ui/Button';
import { HelpTooltip } from '@/src/components/ui/HelpTooltip';
import type { GuitarActionsProps } from './types';
import { GUITAR_HELP_TEXT } from './constants';
import styles from './page.module.css';

export function GuitarActions({
  isFullScreen,
  onToggleFullScreen,
  onStopCamera,
}: GuitarActionsProps) {
  return (
    <div className={styles.actionRow}>
      <div className={styles.actionItem}>
        <Button
          variant={isFullScreen ? 'subtle' : 'ghost'}
          size="sm"
          aria-pressed={isFullScreen}
          onClick={onToggleFullScreen}
        >
          {isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
        </Button>
        <HelpTooltip
          label="Help: Full Screen"
          text={GUITAR_HELP_TEXT.fullScreen}
        />
      </div>
      <div className={styles.actionItem}>
        <Button variant="danger" size="sm" onClick={onStopCamera}>
          Stop Camera
        </Button>
        <HelpTooltip
          label="Help: Stop Camera"
          text={GUITAR_HELP_TEXT.stopCamera}
        />
      </div>
    </div>
  );
}
