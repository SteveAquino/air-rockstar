import { useEffect, useState, useCallback, useRef } from 'react';
import * as Tone from 'tone';
import type { NormalizedLandmark } from '@mediapipe/hands';

type ToneSynth = InstanceType<typeof Tone.Synth>;
type ToneMembraneSynth = InstanceType<typeof Tone.MembraneSynth>;

export interface DrumPad {
  id: string;
  name: string;
  x: number; // percentage of container width
  y: number; // percentage of container height
  width: number; // pixels
  height: number; // pixels
  color: string;
  activeColor: string;
}

const DRUM_PADS: DrumPad[] = [
  { id: 'snare', name: 'Snare', x: 20, y: 20, width: 120, height: 120, color: '#ef4444', activeColor: '#dc2626' },
  { id: 'hihat', name: 'Hi-Hat', x: 70, y: 20, width: 120, height: 120, color: '#3b82f6', activeColor: '#2563eb' },
  { id: 'kick', name: 'Kick', x: 20, y: 60, width: 120, height: 120, color: '#8b5cf6', activeColor: '#7c3aed' },
  { id: 'tom', name: 'Tom', x: 70, y: 60, width: 120, height: 120, color: '#f59e0b', activeColor: '#d97706' },
];

const COOLDOWN_MS = 200;
const INDEX_FINGER_TIP = 8; // MediaPipe landmark index for index finger tip

export function useDrumKit(
  landmarks: NormalizedLandmark[][] | null,
  containerWidth: number,
  containerHeight: number
) {
  const [isReady, setIsReady] = useState(false);
  const [activePads, setActivePads] = useState<Set<string>>(new Set());
  const lastHitTimeRef = useRef<Record<string, number>>({});
  const synthsRef = useRef<Record<string, ToneSynth | ToneMembraneSynth>>({});

  // Initialize Tone.js synths
  useEffect(() => {
    const initAudio = async () => {
      try {
        // Create synths for each drum
        synthsRef.current = {
          snare: new Tone.Synth({
            oscillator: { type: 'triangle' },
            envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.2 },
          }).toDestination(),
          hihat: new Tone.Synth({
            oscillator: { type: 'square' },
            envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 },
          }).toDestination(),
          kick: new Tone.MembraneSynth({
            pitchDecay: 0.05,
            octaves: 4,
            envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.3 },
          }).toDestination(),
          tom: new Tone.Synth({
            oscillator: { type: 'sine' },
            envelope: { attack: 0.01, decay: 0.3, sustain: 0, release: 0.3 },
          }).toDestination(),
        };

        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize Tone.js:', error);
      }
    };

    initAudio();

    // Cleanup
    return () => {
      Object.values(synthsRef.current).forEach(synth => synth.dispose());
    };
  }, []);

  const playSound = useCallback((padId: string) => {
    const now = Date.now();
    const lastHit = lastHitTimeRef.current[padId] || 0;

    // Check cooldown
    if (now - lastHit < COOLDOWN_MS) {
      return;
    }

    // Start audio context on first user interaction
    if (Tone.context.state !== 'running') {
      Tone.start();
    }

    const synth = synthsRef.current[padId];
    if (!synth) return;

    // Play sound based on drum type
    switch (padId) {
      case 'snare':
        synth.triggerAttackRelease('C5', '16n');
        break;
      case 'hihat':
        synth.triggerAttackRelease('G5', '32n');
        break;
      case 'kick':
        (synth as Tone.MembraneSynth).triggerAttackRelease('C1', '8n');
        break;
      case 'tom':
        synth.triggerAttackRelease('G3', '8n');
        break;
    }

    // Update last hit time
    lastHitTimeRef.current[padId] = now;

    // Visual feedback
    setActivePads(prev => new Set(prev).add(padId));
    setTimeout(() => {
      setActivePads(prev => {
        const next = new Set(prev);
        next.delete(padId);
        return next;
      });
    }, 100);
  }, []);

  const checkCollisions = useCallback(() => {
    if (!landmarks || !isReady || containerWidth === 0 || containerHeight === 0) {
      return;
    }

    // Check each hand
    landmarks.forEach(handLandmarks => {
      if (handLandmarks.length > INDEX_FINGER_TIP) {
        const fingerTip = handLandmarks[INDEX_FINGER_TIP];
        
        // Convert normalized coordinates to screen pixels
        const fingerX = fingerTip.x * containerWidth;
        const fingerY = fingerTip.y * containerHeight;

        // Check collision with each drum pad
        DRUM_PADS.forEach(pad => {
          const padX = (pad.x / 100) * containerWidth;
          const padY = (pad.y / 100) * containerHeight;

          const isColliding =
            fingerX >= padX &&
            fingerX <= padX + pad.width &&
            fingerY >= padY &&
            fingerY <= padY + pad.height;

          if (isColliding) {
            playSound(pad.id);
          }
        });
      }
    });
  }, [landmarks, isReady, containerWidth, containerHeight, playSound]);

  // Check collisions on every landmark update
  useEffect(() => {
    checkCollisions();
  }, [checkCollisions]);

  return {
    pads: DRUM_PADS,
    activePads,
    isReady,
  };
}
