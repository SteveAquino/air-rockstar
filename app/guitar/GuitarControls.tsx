import { SegmentedControl } from '@/src/components/ui/SegmentedControl';
import { Slider } from '@/src/components/ui/Slider';
import type { GuitarSoundVariant } from '@/src/types/guitar';
import type { GuitarControlsProps } from './types';
import { GUITAR_HELP_TEXT, SOUND_VARIANTS } from './constants';
import styles from './page.module.css';

export function GuitarControls({
  sensitivity,
  spacing,
  position,
  volume,
  fretCount,
  variant,
  onSensitivityChange,
  onSpacingChange,
  onPositionChange,
  onVolumeChange,
  onFretCountChange,
  onVariantChange,
}: GuitarControlsProps) {
  return (
    <>
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
          min={20}
          max={100}
          unit="%"
          onChange={onSpacingChange}
          helpText={GUITAR_HELP_TEXT.spacing}
        />
        <Slider
          label="String Position"
          value={position}
          min={0}
          max={100}
          unit="%"
          onChange={onPositionChange}
          helpText={GUITAR_HELP_TEXT.position}
        />
        <Slider
          label="Frets"
          value={fretCount}
          min={12}
          max={24}
          onChange={onFretCountChange}
          helpText={GUITAR_HELP_TEXT.frets}
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

      <SegmentedControl
        label="Sound Variant"
        value={variant}
        helpText={GUITAR_HELP_TEXT.soundVariant}
        onChange={(value) => onVariantChange(value as GuitarSoundVariant)}
        options={SOUND_VARIANTS}
      />
    </>
  );
}
