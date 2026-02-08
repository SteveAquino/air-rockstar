import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import type { NormalizedLandmark } from '@mediapipe/hands';

/**
 * Available drum kit sound variants
 */
export type DrumKitVariant = 'synth' | 'acoustic';

/**
 * Drum sample URLs for acoustic kit
 * Using locally hosted samples from MIDI.js Soundfonts (public domain)
 */
const DRUM_SAMPLES: Record<string, string> = {
  snare: '/sounds/drums/snare.mp3',
  hihat: '/sounds/drums/hihat.mp3',
  kick: '/sounds/drums/kick.mp3',
  tom: '/sounds/drums/tom.mp3',
};

/**
 * Represents a virtual drum pad in the kit
 */
export interface DrumPad {
  /** Unique identifier for the drum pad */
  id: string;
  /** Display name of the drum */
  name: string;
  /** X position as percentage of container width */
  x: number;
  /** Y position as percentage of container height */
  y: number;
  /** Width in pixels */
  width: number;
  /** Height in pixels */
  height: number;
  /** Default color */
  color: string;
  /** Color when pad is active/hit */
  activeColor: string;
}

export interface DrumKitOptions {
  /** Scale factor for pad size */
  padScale?: number;
  /** Extra padding (px) around pads for hit detection */
  hitPadding?: number;
  /** Master volume (0 to 1) */
  volume?: number;
  /** Callback when a pad is hit */
  onHit?: (padId: string) => void;
}

const DRUM_PADS: DrumPad[] = [
  { id: 'snare', name: 'Snare', x: 20, y: 20, width: 120, height: 120, color: '#ef4444', activeColor: '#dc2626' },
  { id: 'hihat', name: 'Hi-Hat', x: 70, y: 20, width: 120, height: 120, color: '#3b82f6', activeColor: '#2563eb' },
  { id: 'kick', name: 'Kick', x: 20, y: 60, width: 120, height: 120, color: '#8b5cf6', activeColor: '#7c3aed' },
  { id: 'tom', name: 'Tom', x: 70, y: 60, width: 120, height: 120, color: '#f59e0b', activeColor: '#d97706' },
];

// MediaPipe landmark indices for all finger tips
const FINGER_TIPS = [4, 8, 12, 16, 20]; // thumb, index, middle, ring, pinky

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const computeVolumeScale = (volume: number) => {
  const clampedVolume = clamp(volume, 0, 1);
  const logCurve = Math.log10(1 + 9 * clampedVolume) / Math.log10(10);
  return clampedVolume <= 0.4
    ? 2 * logCurve
    : 2 * (logCurve + (1 - logCurve) * Math.pow((clampedVolume - 0.4) / 0.6, 0.6));
};

const computeScaledPads = (
  padScale: number,
  containerWidth: number,
  containerHeight: number
) => {
  const hasContainer = containerWidth > 0 && containerHeight > 0;
  return DRUM_PADS.map((pad) => {
    const width = pad.width * padScale;
    const height = pad.height * padScale;
    if (!hasContainer) {
      return { ...pad, width, height };
    }

    const deltaX = ((width - pad.width) / 2 / containerWidth) * 100;
    const deltaY = ((height - pad.height) / 2 / containerHeight) * 100;

    return {
      ...pad,
      width,
      height,
      x: pad.x - deltaX,
      y: pad.y - deltaY,
    };
  });
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

const loadDrumSamples = async (
  audioContext: AudioContext,
  target: Record<string, AudioBuffer>
) => {
  const loadPromises = Object.entries(DRUM_SAMPLES).map(async ([drumId, url]) => {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      target[drumId] = audioBuffer;
    } catch (error) {
      console.error(`Failed to load sample for ${drumId}:`, error);
    }
  });

  await Promise.all(loadPromises);
};

const playSynthSound = (
  padId: string,
  audioContext: AudioContext,
  output: AudioNode
) => {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(output);

  switch (padId) {
    case 'snare':
      oscillator.type = 'triangle';
      oscillator.frequency.value = 200;
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.2
      );
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
      break;
    case 'hihat':
      oscillator.type = 'square';
      oscillator.frequency.value = 800;
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.1
      );
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
      break;
    case 'kick':
      oscillator.type = 'sine';
      oscillator.frequency.value = 60;
      gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.5
      );
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
      break;
    case 'tom':
      oscillator.type = 'sine';
      oscillator.frequency.value = 150;
      gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.3
      );
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
      break;
  }
};

/**
 * Custom hook for managing virtual drum kit with hand tracking
 * 
 * Detects collisions between finger tips and drum pads, playing sounds
 * using the Web Audio API. Tracks collision state to only trigger sounds
 * when fingers enter pad areas (not continuously while inside).
 * 
 * @param landmarks - Array of hand landmarks from MediaPipe Hands
 * @param containerWidth - Width of the video container in pixels
 * @param containerHeight - Height of the video container in pixels
 * @param variant - Sound variant to use ('synth' or 'acoustic')
 * @returns Object containing drum pads, active pad states, ready status, and variant setter
 */
export function useDrumKit(
  landmarks: NormalizedLandmark[][] | null,
  containerWidth: number,
  containerHeight: number,
  variant: DrumKitVariant = 'synth',
  options: DrumKitOptions = {}
) {
  const [isReady, setIsReady] = useState(false);
  const [activePads, setActivePads] = useState<Set<string>>(new Set());
  const collidingPadsRef = useRef<Map<number, Set<string>>>(new Map()); // Track which pads each finger is colliding with
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBuffersRef = useRef<Record<string, AudioBuffer>>({});
  const masterGainRef = useRef<GainNode | null>(null);
  const padScale = Number.isFinite(options.padScale) ? options.padScale! : 1;
  const hitPadding = Number.isFinite(options.hitPadding) ? options.hitPadding! : 0;
  const onHit = options.onHit;
  const volume = Number.isFinite(options.volume) ? options.volume! : 1;
  const volumeScale = computeVolumeScale(volume);

  const scaledPads = useMemo(
    () => computeScaledPads(padScale, containerWidth, containerHeight),
    [padScale, containerWidth, containerHeight]
  );

  // Initialize Web Audio API and load samples
  useEffect(() => {
    const initAudio = async () => {
      try {
        // Create audio context
        audioContextRef.current = createAudioContext();
        masterGainRef.current = createMasterGain(audioContextRef.current);
        
        // Load drum samples for acoustic variant
        if (variant === 'acoustic') {
          await loadDrumSamples(audioContextRef.current, audioBuffersRef.current);
        }
        
        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize Web Audio:', error);
        setIsReady(true); // Still set ready even if sample loading fails, synth will work
      }
    };

    if (typeof window !== 'undefined') {
      initAudio();
    }

    // Cleanup
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [variant]);

  useEffect(() => {
    const audioContext = audioContextRef.current;
    const masterGain = masterGainRef.current;
    if (!audioContext || !masterGain) return;
    updateMasterGain(audioContext, masterGain, volumeScale);
  }, [volumeScale]);

  const playSound = useCallback((padId: string) => {
    const audioContext = audioContextRef.current;
    if (!audioContext) return;

    // Resume audio context on first user interaction
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    const outputNode = masterGainRef.current ?? audioContext.destination;

    if (variant === 'acoustic') {
      // Play sample-based sound
      const buffer = audioBuffersRef.current[padId];
      if (buffer) {
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(outputNode);
        source.start(0);
      }
    } else {
      playSynthSound(padId, audioContext, outputNode);
    }

    // Visual feedback
    setActivePads(prev => new Set(prev).add(padId));
    setTimeout(() => {
      setActivePads(prev => {
        const next = new Set(prev);
        next.delete(padId);
        return next;
      });
    }, 100);
  }, [variant]);

  const checkCollisions = useCallback(() => {
    if (!landmarks || !isReady || containerWidth === 0 || containerHeight === 0) {
      return;
    }

    const currentCollisions = new Map<number, Set<string>>();

    // Check each hand
    landmarks.forEach((_handLandmarks, _handIndex) => {
      // Check all finger tips
      FINGER_TIPS.forEach(fingerIndex => {
        if (_handLandmarks.length > fingerIndex) {
          const fingerTip = _handLandmarks[fingerIndex];
          
          // Group by finger type (not by individual hand)
          // So left index and right index share the same collision state
          if (!currentCollisions.has(fingerIndex)) {
            currentCollisions.set(fingerIndex, new Set());
          }
          
          // Convert normalized coordinates to screen pixels
          // Mirror X coordinate to match the mirrored video display
          const fingerX = (1 - fingerTip.x) * containerWidth;
          const fingerY = fingerTip.y * containerHeight;

          // Check collision with each drum pad
          scaledPads.forEach(pad => {
            const padX = (pad.x / 100) * containerWidth;
            const padY = (pad.y / 100) * containerHeight;

            const isColliding =
              fingerX >= padX - hitPadding &&
              fingerX <= padX + pad.width + hitPadding &&
              fingerY >= padY - hitPadding &&
              fingerY <= padY + pad.height + hitPadding;

            if (isColliding) {
              currentCollisions.get(fingerIndex)!.add(pad.id);
              
              // Only play sound if this finger type wasn't colliding with this pad before
              const previousCollisions = collidingPadsRef.current.get(fingerIndex);
              if (!previousCollisions || !previousCollisions.has(pad.id)) {
                playSound(pad.id);
                if (onHit) {
                  onHit(pad.id);
                }
              }
            }
          });
        }
      });
    });

    // Update the collision state for next frame
    collidingPadsRef.current = currentCollisions;
  }, [
    landmarks,
    isReady,
    containerWidth,
    containerHeight,
    playSound,
    hitPadding,
    onHit,
    scaledPads,
  ]);

  // Check collisions on every landmark update
  useEffect(() => {
    checkCollisions();
  }, [checkCollisions]);

  return {
    pads: scaledPads,
    activePads,
    isReady,
  };
}
