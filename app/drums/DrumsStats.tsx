import { HelpTooltip } from '@/src/components/ui/HelpTooltip';
import type { DrumsStatsProps } from './types';
import { DRUM_HELP_TEXT } from './constants';
import styles from './page.module.css';

export function DrumsStats({ combo, tempoLabel, hits }: DrumsStatsProps) {
  return (
    <div className={styles.statsRow}>
      <div className={styles.stat}>
        <div className={styles.statHeader}>
          <span className={styles.statLabel}>Combo</span>
          <HelpTooltip label="Help: Combo" text={DRUM_HELP_TEXT.combo} />
        </div>
        <span className={styles.statValue}>{combo}</span>
      </div>
      <div className={styles.stat}>
        <div className={styles.statHeader}>
          <span className={styles.statLabel}>Tempo</span>
          <HelpTooltip label="Help: Tempo" text={DRUM_HELP_TEXT.tempo} />
        </div>
        <span className={styles.statValue}>{tempoLabel}</span>
      </div>
      <div className={styles.stat}>
        <div className={styles.statHeader}>
          <span className={styles.statLabel}>Hits</span>
          <HelpTooltip label="Help: Hits" text={DRUM_HELP_TEXT.hits} />
        </div>
        <span className={styles.statValue}>{hits}</span>
      </div>
    </div>
  );
}
