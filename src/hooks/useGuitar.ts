import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { NormalizedLandmark } from '@mediapipe/hands';
import type { GuitarOptions, GuitarString } from '@/src/types/guitar';

export type { GuitarOptions, GuitarString } from '@/src/types/guitar';

const FINGER_TIPS = [4, 8, 12, 16, 20];

const BASE_STRINGS = [
  { id: 'e4', label: 'E', note: 'E4', frequency: 329.63, color: '#6ee7ff', activeColor: '#22d3ee' },
  { id: 'b3', label: 'B', note: 'B3', frequency: 246.94, color: '#a5b4fc', activeColor: '#818cf8' },
  { id: 'g3', label: 'G', note: 'G3', frequency: 196.0, color: '#c4b5fd', activeColor: '#a78bfa' },
  { id: 'd3', label: 'D', note: 'D3', frequency: 146.83, color: '#fde68a', activeColor: '#fbbf24' },
  { id: 'a2', label: 'A', note: 'A2', frequency: 110.0, color: '#fcd34d', activeColor: '#f59e0b' },
  { id: 'e2', label: 'E', note: 'E2', frequency: 82.41, color: '#fca5a5', activeColor: '#f87171' },
] as const;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const computeVolumeScale = (volume: number) => {
  const clampedVolume = clamp(volume, 0, 1);
  const logCurve = Math.log10(1 + 9 * clampedVolume) / Math.log10(10);
  return clampedVolume <= 0.4
    ? 2 * logCurve
    : 2 * (logCurve + (1 - logCurve) * Math.pow((clampedVolume - 0.4) / 0.6, 0.6));
};

const createAudioContext = () =>
  new (window.AudioContext || (window as any).webkitAudioContext)();

const createMasterGain = (audioContext: AudioContext, initialGain = 1) => {
  const gainNode = audioContext.createGain();
  gainNode.gain.setValueAtTime(initialGain, audioContext.currentTime);
  gainNode.connect(audioContext.destination);
  return gainNode;
};

const updateMasterGain = (
  audioContext: AudioContext,
  masterGain: GainNode,
  volumeScale: number
) => {
  masterGain.gain.setValueAtTime(volumeScale, audioContext.currentTime);
};

const playPluck = (
  frequency: number,
  audioContext: AudioContext,
  output: AudioNode
) => {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = 'triangle';
  oscillator.frequency.value = frequency;
  oscillator.connect(gainNode);
  gainNode.connect(output);

  const now = audioContext.currentTime;
  gainNode.gain.setValueAtTime(0.0001, now);
  gainNode.gain.exponentialRampToValueAtTime(0.6, now + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

  oscillator.start(now);
  oscillator.stop(now + 0.3);
};

const computeStrings = (
  containerHeight: number,
  spacingScale: number,
  thicknessPx: number
): GuitarString[] => {
  if (containerHeight <= 0) {
    return BASE_STRINGS.map((string, index) => ({
      ...string,
      yPercent: (index / (BASE_STRINGS.length - 1)) * 100,
      thicknessPx,
    }));
  }

  const usableHeight = containerHeight * spacingScale;
  let topOffset = containerHeight * 0.66;
  if (topOffset + usableHeight > containerHeight) {
    topOffset = Math.max(0, containerHeight - usableHeight);
  }
  const spacing = usableHeight / (BASE_STRINGS.length - 1);

  return BASE_STRINGS.map((string, index) => {
    const centerY = topOffset + index * spacing;
    return {
      ...string,
      yPercent: (centerY / containerHeight) * 100,
      thicknessPx,
    };
  });
};

const buildEmptyFrets = (strings: GuitarString[]) =>
  strings.reduce<Record<string, number>>((acc, string) => {
    acc[string.id] = 0;
    return acc;
  }, {});

const areFrettedEqual = (
  left: Record<string, number>,
  right: Record<string, number>
) => {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  if (leftKeys.length !== rightKeys.length) return false;
  return leftKeys.every((key) => left[key] === right[key]);
};

export function useGuitar(
  landmarks: NormalizedLandmark[][] | null,
  containerWidth: number,
  containerHeight: number,
  options: GuitarOptions = {}
) {
  const [isReady, setIsReady] = useState(false);
  const [activeStrings, setActiveStrings] = useState<Set<string>>(new Set());
  const [frettedStrings, setFrettedStrings] = useState<Record<string, number>>(
    {}
  );
  const collidingStringsRef = useRef<Map<number, Set<string>>>(new Map());
  const lastHitRef = useRef<Record<string, number>>({});
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);

  const spacingScale = Number.isFinite(options.stringSpacing)
    ? clamp(options.stringSpacing!, 0.2, 0.34)
    : 0.28;
  const hitPadding = Number.isFinite(options.hitPadding) ? options.hitPadding! : 0;
  const volume = Number.isFinite(options.volume) ? options.volume! : 1;
  const fretCount = Number.isFinite(options.fretCount)
    ? Math.max(1, Math.round(options.fretCount!))
    : 20;
  const fretZoneWidthRatio = Number.isFinite(options.fretZoneWidthRatio)
    ? clamp(options.fretZoneWidthRatio!, 0.2, 0.9)
    : 0.67;
  const strumZoneWidthRatio = Number.isFinite(options.strumZoneWidthRatio)
    ? clamp(options.strumZoneWidthRatio!, 0.2, 0.9)
    : 0.33;
  const cooldownMs = Number.isFinite(options.cooldownMs) ? options.cooldownMs! : 200;
  const volumeScale = computeVolumeScale(volume);
  const thicknessPx = Number.isFinite(options.stringThickness)
    ? options.stringThickness!
    : 12;

  const strings = useMemo(
    () => computeStrings(containerHeight, spacingScale, thicknessPx),
    [containerHeight, spacingScale, thicknessPx]
  );

  useEffect(() => {
    setFrettedStrings(buildEmptyFrets(strings));
  }, [strings]);

  useEffect(() => {
    const initAudio = () => {
      try {
        audioContextRef.current = createAudioContext();
        masterGainRef.current = createMasterGain(audioContextRef.current);
        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize Web Audio:', error);
        setIsReady(true);
      }
    };

    if (typeof window !== 'undefined') {
      initAudio();
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    const audioContext = audioContextRef.current;
    const masterGain = masterGainRef.current;
    if (!audioContext || !masterGain) return;
    updateMasterGain(audioContext, masterGain, volumeScale);
  }, [volumeScale]);

  const onHit = options.onHit;

  const triggerHit = useCallback(
    (stringId: string, frequency: number) => {
      const audioContext = audioContextRef.current;
      if (!audioContext) return;

      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      const outputNode = masterGainRef.current ?? audioContext.destination;
      playPluck(frequency, audioContext, outputNode);

      setActiveStrings((prev) => new Set(prev).add(stringId));
      setTimeout(() => {
        setActiveStrings((prev) => {
          const next = new Set(prev);
          next.delete(stringId);
          return next;
        });
      }, 120);
    },
    []
  );

  const checkCollisions = useCallback(() => {
    if (!landmarks || !isReady || containerHeight === 0 || containerWidth === 0) {
      return;
    }

    const nextFretted = buildEmptyFrets(strings);
    const fretCandidates = buildEmptyFrets(strings);
    let hasFretZoneContact = false;
    const fretZoneMaxX = containerWidth * fretZoneWidthRatio;
    const strumZoneMinX = Math.max(
      containerWidth * (1 - strumZoneWidthRatio),
      fretZoneMaxX
    );

    const currentCollisions = new Map<number, Set<string>>();

    landmarks.forEach((handLandmarks) => {
      FINGER_TIPS.forEach((fingerIndex) => {
        if (handLandmarks.length > fingerIndex) {
          const fingerTip = handLandmarks[fingerIndex];

          const fingerX = (1 - fingerTip.x) * containerWidth;
          const fingerY = fingerTip.y * containerHeight;

          strings.forEach((string) => {
            const centerY = (string.yPercent / 100) * containerHeight;
            const bandHalf = string.thicknessPx / 2 + hitPadding;
            const isInBand =
              fingerY >= centerY - bandHalf && fingerY <= centerY + bandHalf;

            if (fingerX <= fretZoneMaxX) {
              hasFretZoneContact = true;
            }

            if (isInBand && fingerX <= fretZoneMaxX) {
              const rawFret =
                (fingerX / Math.max(fretZoneMaxX, 1)) * fretCount;
              const fret = clamp(Math.floor(rawFret) + 1, 1, fretCount);
              fretCandidates[string.id] = Math.max(fretCandidates[string.id], fret);
            }
          });
        }
      });
    });

    if (hasFretZoneContact) {
      strings.forEach((string) => {
        nextFretted[string.id] = fretCandidates[string.id];
      });
    }

    landmarks.forEach((handLandmarks) => {
      FINGER_TIPS.forEach((fingerIndex) => {
        if (handLandmarks.length > fingerIndex) {
          const fingerTip = handLandmarks[fingerIndex];

          if (!currentCollisions.has(fingerIndex)) {
            currentCollisions.set(fingerIndex, new Set());
          }

          const fingerX = (1 - fingerTip.x) * containerWidth;
          if (fingerX < strumZoneMinX) {
            return;
          }
          const fingerY = fingerTip.y * containerHeight;

          strings.forEach((string) => {
            const centerY = (string.yPercent / 100) * containerHeight;
            const bandHalf = string.thicknessPx / 2 + hitPadding;
            const isColliding =
              fingerY >= centerY - bandHalf && fingerY <= centerY + bandHalf;

            if (isColliding) {
              currentCollisions.get(fingerIndex)!.add(string.id);

              const previous = collidingStringsRef.current.get(fingerIndex);
              const wasColliding = previous && previous.has(string.id);
              const lastHit = lastHitRef.current[string.id] ?? 0;
              const now = Date.now();
              const fret = nextFretted[string.id] ?? 0;
              const frequency =
                string.frequency * Math.pow(2, fret / 12);

              if (!wasColliding && now - lastHit >= cooldownMs) {
                lastHitRef.current[string.id] = now;
                triggerHit(string.id, frequency);
                if (onHit) {
                  onHit(string.id);
                }
              }
            }
          });
        }
      });
    });

    setFrettedStrings((prev) =>
      areFrettedEqual(prev, nextFretted) ? prev : nextFretted
    );

    collidingStringsRef.current = currentCollisions;
  }, [
    landmarks,
    isReady,
    containerHeight,
    containerWidth,
    strings,
    frettedStrings,
    hitPadding,
    fretCount,
    fretZoneWidthRatio,
    strumZoneWidthRatio,
    cooldownMs,
    triggerHit,
    onHit,
  ]);

  useEffect(() => {
    checkCollisions();
  }, [checkCollisions]);

  return {
    strings,
    activeStrings,
    frettedStrings,
    isReady,
  };
}
