import { Button } from '@/src/components/ui/Button';
import { HelpTooltip } from '@/src/components/ui/HelpTooltip';
import type { DrumsActionsProps } from './types';
import { DRUM_HELP_TEXT } from './constants';
import styles from './page.module.css';

export function DrumsActions({
  isFullScreen,
  onToggleFullScreen,
  onStopCamera,
}: DrumsActionsProps) {
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
          text={DRUM_HELP_TEXT.fullScreen}
        />
      </div>
      <div className={styles.actionItem}>
        <Button variant="danger" size="sm" onClick={onStopCamera}>
          Stop Camera
        </Button>
        <HelpTooltip
          label="Help: Stop Camera"
          text={DRUM_HELP_TEXT.stopCamera}
        />
      </div>
    </div>
  );
}
