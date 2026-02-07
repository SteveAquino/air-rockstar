import { useEffect, useState, useCallback, useRef } from 'react';
import type { NormalizedLandmark } from '@mediapipe/hands';

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

const DRUM_PADS: DrumPad[] = [
  { id: 'snare', name: 'Snare', x: 20, y: 20, width: 120, height: 120, color: '#ef4444', activeColor: '#dc2626' },
  { id: 'hihat', name: 'Hi-Hat', x: 70, y: 20, width: 120, height: 120, color: '#3b82f6', activeColor: '#2563eb' },
  { id: 'kick', name: 'Kick', x: 20, y: 60, width: 120, height: 120, color: '#8b5cf6', activeColor: '#7c3aed' },
  { id: 'tom', name: 'Tom', x: 70, y: 60, width: 120, height: 120, color: '#f59e0b', activeColor: '#d97706' },
];

// MediaPipe landmark indices for all finger tips
const FINGER_TIPS = [4, 8, 12, 16, 20]; // thumb, index, middle, ring, pinky

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
 * @returns Object containing drum pads, active pad states, and ready status
 */
export function useDrumKit(
  landmarks: NormalizedLandmark[][] | null,
  containerWidth: number,
  containerHeight: number
) {
  const [isReady, setIsReady] = useState(false);
  const [activePads, setActivePads] = useState<Set<string>>(new Set());
  const collidingPadsRef = useRef<Map<number, Set<string>>>(new Map()); // Track which pads each finger is colliding with
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize Web Audio API
  useEffect(() => {
    const initAudio = async () => {
      try {
        // Create audio context
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize Web Audio:', error);
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
  }, []);

  const playSound = useCallback((padId: string) => {
    const audioContext = audioContextRef.current;
    if (!audioContext) return;

    // Resume audio context on first user interaction
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    // Create oscillator for drum sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Configure sound based on drum type
    switch (padId) {
      case 'snare':
        oscillator.type = 'triangle';
        oscillator.frequency.value = 200;
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
        break;
      case 'hihat':
        oscillator.type = 'square';
        oscillator.frequency.value = 800;
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
        break;
      case 'kick':
        oscillator.type = 'sine';
        oscillator.frequency.value = 60;
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
        break;
      case 'tom':
        oscillator.type = 'sine';
        oscillator.frequency.value = 150;
        gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
        break;
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
  }, []);

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
          DRUM_PADS.forEach(pad => {
            const padX = (pad.x / 100) * containerWidth;
            const padY = (pad.y / 100) * containerHeight;

            const isColliding =
              fingerX >= padX &&
              fingerX <= padX + pad.width &&
              fingerY >= padY &&
              fingerY <= padY + pad.height;

            if (isColliding) {
              currentCollisions.get(fingerIndex)!.add(pad.id);
              
              // Only play sound if this finger type wasn't colliding with this pad before
              const previousCollisions = collidingPadsRef.current.get(fingerIndex);
              if (!previousCollisions || !previousCollisions.has(pad.id)) {
                playSound(pad.id);
              }
            }
          });
        }
      });
    });

    // Update the collision state for next frame
    collidingPadsRef.current = currentCollisions;
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
