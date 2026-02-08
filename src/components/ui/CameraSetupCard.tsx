import { Button } from './Button';
import { Card } from './Card';
import type { CameraSetupCardProps } from './types';
import styles from './CameraSetupCard.module.css';

export type { CameraSetupCardProps } from './types';

const DEFAULT_DESCRIPTION =
  'Enable your camera to start tracking your hand movements.';
const DEFAULT_BUTTON_LABEL = 'Enable Camera';
const DEFAULT_LOADING_LABEL = 'Initializing...';

/**
 * Shared camera setup card for instrument pages.
 */
export function CameraSetupCard({
  title,
  description = DEFAULT_DESCRIPTION,
  isRequesting,
  onEnable,
  buttonLabel = DEFAULT_BUTTON_LABEL,
  loadingLabel = DEFAULT_LOADING_LABEL,
}: CameraSetupCardProps) {
  const isInteractive = Boolean(onEnable) && !isRequesting;

  return (
    <Card className={styles.card}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.description}>{description}</p>
      <Button
        onClick={onEnable}
        disabled={!isInteractive}
        aria-label="Enable camera for hand tracking"
      >
        {isRequesting ? loadingLabel : buttonLabel}
      </Button>
    </Card>
  );
}
