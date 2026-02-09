import { Button } from '@/src/components/ui/Button';
import { HelpTooltip } from '@/src/components/ui/HelpTooltip';
import { SegmentedControl } from '@/src/components/ui/SegmentedControl';
import { Slider } from '@/src/components/ui/Slider';
import { classNames } from '@/src/utils/classNames';
import type { DrumKitVariant } from '@/src/types/drumKit';
import type { DrumsControlsProps } from './types';
import { DRUM_HELP_TEXT, DRUM_KIT_PIECES, SOUND_VARIANTS } from './constants';
import styles from './page.module.css';

export function DrumsControls({
  sensitivity,
  padSize,
  volume,
  variant,
  enabledPads,
  onSensitivityChange,
  onPadSizeChange,
  onVolumeChange,
  onVariantChange,
  onTogglePad,
}: DrumsControlsProps) {
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
          helpText={DRUM_HELP_TEXT.sensitivity}
        />
        <Slider
          label="Size"
          value={padSize}
          min={20}
          max={90}
          unit="%"
          onChange={onPadSizeChange}
          helpText={DRUM_HELP_TEXT.size}
        />
        <Slider
          label="Volume"
          value={volume}
          min={0}
          max={100}
          unit="%"
          onChange={onVolumeChange}
          helpText={DRUM_HELP_TEXT.volume}
        />
      </div>

      <div className={styles.kitToggleGroup}>
        <div className={styles.kitToggleHeader}>
          <span className={styles.kitToggleLabel}>Kit Pieces</span>
          <HelpTooltip label="Help: Kit Pieces" text={DRUM_HELP_TEXT.kitPieces} />
        </div>
        <div
          className={styles.kitToggleRow}
          role="group"
          aria-label="Kit Pieces"
        >
          {DRUM_KIT_PIECES.map((piece) => {
            const isActive = enabledPads.has(piece.id);
            return (
              <Button
                key={piece.id}
                type="button"
                size="sm"
                variant="ghost"
                aria-pressed={isActive}
                className={classNames(
                  styles.kitToggleButton,
                  isActive && styles.kitToggleButtonActive
                )}
                onClick={() => onTogglePad(piece.id)}
              >
                {piece.label}
              </Button>
            );
          })}
        </div>
      </div>

      <SegmentedControl
        label="Sound Variant"
        value={variant}
        helpText={DRUM_HELP_TEXT.soundVariant}
        onChange={(value) => onVariantChange(value as DrumKitVariant)}
        options={SOUND_VARIANTS}
      />
    </>
  );
}
