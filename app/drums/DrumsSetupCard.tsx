import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import type { DrumsSetupCardProps } from './types';
import styles from './page.module.css';

export function DrumsSetupCard({
  isRequesting,
  onEnable,
}: DrumsSetupCardProps) {
  return (
    <Card className={styles.setupCard}>
      <h1 className={styles.title}>Air Drums</h1>
      <p className={styles.description}>
        Enable your camera to start tracking your hand movements.
      </p>
      <Button
        onClick={onEnable}
        disabled={isRequesting}
        aria-label="Enable camera for hand tracking"
      >
        {isRequesting ? 'Initializing...' : 'Enable Camera'}
      </Button>
    </Card>
  );
}
