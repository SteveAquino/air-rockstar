import Link from 'next/link';
import { StatusPill } from '@/src/components/ui/StatusPill';
import type { DrumsHeaderProps } from './types';
import styles from './page.module.css';

export function DrumsHeader({
  handsDetected,
  isReady,
  hasStream,
}: DrumsHeaderProps) {
  return (
    <header className={styles.topBar}>
      <Link href="/" className={styles.backLink}>
        Back
      </Link>
      <StatusPill tone="info" label="Air Drums" />
      <div className={styles.statusGroup}>
        <StatusPill
          tone={hasStream ? 'ready' : 'locked'}
          label={hasStream ? 'Camera Ready' : 'Camera Not Ready'}
        />
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
  );
}
