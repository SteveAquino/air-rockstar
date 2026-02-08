import Link from 'next/link';
import { StatusPill } from '@/src/components/ui/StatusPill';
import type { GuitarHeaderProps } from './types';
import styles from './page.module.css';

export function GuitarHeader({ handsDetected, isReady }: GuitarHeaderProps) {
  return (
    <header className={styles.topBar}>
      <Link href="/" className={styles.backLink}>
        Back
      </Link>
      <StatusPill tone="info" label="Air Guitar" />
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
  );
}
