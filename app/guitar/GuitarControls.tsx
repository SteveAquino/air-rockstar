import { Slider } from '@/src/components/ui/Slider';
import type { GuitarControlsProps } from './types';
import { GUITAR_HELP_TEXT } from './constants';
import styles from './page.module.css';

export function GuitarControls({
  sensitivity,
  spacing,
  volume,
  onSensitivityChange,
  onSpacingChange,
  onVolumeChange,
}: GuitarControlsProps) {
  return (
    <div className={styles.sliderGroup}>
      <Slider
        label="Sensitivity"
        value={sensitivity}
        min={0}
        max={100}
        unit="%"
        onChange={onSensitivityChange}
        helpText={GUITAR_HELP_TEXT.sensitivity}
      />
      <Slider
        label="String Spacing"
        value={spacing}
        min={40}
        max={100}
        unit="%"
        onChange={onSpacingChange}
        helpText={GUITAR_HELP_TEXT.spacing}
      />
      <Slider
        label="Volume"
        value={volume}
        min={0}
        max={100}
        unit="%"
        onChange={onVolumeChange}
        helpText={GUITAR_HELP_TEXT.volume}
      />
    </div>
  );
}
