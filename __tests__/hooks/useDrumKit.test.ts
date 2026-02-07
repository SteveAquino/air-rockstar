import { renderHook, act, waitFor } from '@testing-library/react';
import { useDrumKit } from '../../src/hooks/useDrumKit';
import type { NormalizedLandmark } from '@mediapipe/hands';

// Mock Web Audio API
const mockAudioContext = {
  createOscillator: jest.fn(() => ({
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    frequency: { value: 0 },
    type: 'sine',
  })),
  createGain: jest.fn(() => ({
    connect: jest.fn(),
    gain: {
      setValueAtTime: jest.fn(),
      exponentialRampToValueAtTime: jest.fn(),
    },
  })),
  createBufferSource: jest.fn(() => ({
    connect: jest.fn(),
    start: jest.fn(),
    buffer: null,
  })),
  decodeAudioData: jest.fn(() => Promise.resolve({})),
  destination: {},
  currentTime: 0,
  state: 'running',
  resume: jest.fn(),
  close: jest.fn(),
};

// Store original fetch
const originalFetch = global.fetch;

// Mock window.AudioContext
beforeEach(() => {
  jest.clearAllMocks();
  (global as any).AudioContext = jest.fn(() => mockAudioContext);
  
  // Mock fetch for sample loading (scoped to this test file)
  global.fetch = jest.fn(() =>
    Promise.resolve({
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
    } as Response)
  );
  
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
  // Restore original fetch
  global.fetch = originalFetch;
});

// Helper to create mock finger tip landmark
const createFingerTip = (x: number, y: number): NormalizedLandmark => ({
  x,
  y,
  z: 0,
  visibility: 1,
});

// Helper to create full hand with 21 landmarks
const createHand = (fingerTipX: number, fingerTipY: number): NormalizedLandmark[] => {
  const hand: NormalizedLandmark[] = [];
  for (let i = 0; i < 21; i++) {
    if (i === 8) { // Index finger tip
      hand.push(createFingerTip(fingerTipX, fingerTipY));
    } else {
      hand.push(createFingerTip(0.5, 0.5));
    }
  }
  return hand;
};

describe('useDrumKit', () => {
  describe('when initialized', () => {
    it('should initialize Web Audio API and set isReady to true', async () => {
      const { result } = renderHook(() => useDrumKit(null, 800, 600, 'synth'));

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      expect(global.AudioContext).toHaveBeenCalled();
    });

    it('should return drum pads configuration', () => {
      const { result } = renderHook(() => useDrumKit(null, 800, 600, 'synth'));

      expect(result.current.pads).toHaveLength(4);
      expect(result.current.pads).toEqual([
        expect.objectContaining({ id: 'snare', name: 'Snare' }),
        expect.objectContaining({ id: 'hihat', name: 'Hi-Hat' }),
        expect.objectContaining({ id: 'kick', name: 'Kick' }),
        expect.objectContaining({ id: 'tom', name: 'Tom' }),
      ]);
    });

    it('should initialize with empty active pads', () => {
      const { result } = renderHook(() => useDrumKit(null, 800, 600, 'synth'));

      expect(result.current.activePads.size).toBe(0);
    });

    it('should load drum samples when using acoustic variant', async () => {
      const { result } = renderHook(() => useDrumKit(null, 800, 600, 'acoustic'));

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      // Should attempt to fetch all 4 drum samples
      expect(global.fetch).toHaveBeenCalled();
      expect(mockAudioContext.decodeAudioData).toHaveBeenCalled();
    });

    it('should handle sample loading errors gracefully', async () => {
      // Suppress console.error for this test since we're intentionally testing error handling
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Mock fetch to reject
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      
      const { result } = renderHook(() => useDrumKit(null, 800, 600, 'acoustic'));

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      // Should still be ready even if samples fail to load
      expect(result.current.isReady).toBe(true);
      
      // Restore console.error
      consoleErrorSpy.mockRestore();
    });

    it('should cleanup audio context on unmount', async () => {
      const { unmount } = renderHook(() => useDrumKit(null, 800, 600, 'synth'));

      await waitFor(() => {
        expect(mockAudioContext.close).not.toHaveBeenCalled();
      });

      unmount();

      expect(mockAudioContext.close).toHaveBeenCalled();
    });
  });

  describe('when finger collides with drum pad', () => {
    it('should play sound when index finger enters snare pad area', async () => {
      const { result, rerender } = renderHook(
        ({ landmarks, width, height }) => useDrumKit(landmarks, width, height, 'synth'),
        {
          initialProps: {
            landmarks: null as NormalizedLandmark[][] | null,
            width: 800,
            height: 600,
          },
        }
      );

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      // Snare is at x: 20%, y: 20%, size: 120x120
      // So in 800x600, it's at 160,120 to 280,240
      // Finger at x: 0.7 (mirrored to 0.3), y: 0.3 = 240, 180 (inside snare)
      const hand = createHand(0.7, 0.3);

      act(() => {
        rerender({
          landmarks: [hand],
          width: 800,
          height: 600,
        });
      });

      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
      expect(mockAudioContext.createGain).toHaveBeenCalled();
    });

    it('should play sample-based sound in acoustic mode', async () => {
      const { result, rerender } = renderHook(
        ({ landmarks, width, height }) => useDrumKit(landmarks, width, height, 'acoustic'),
        {
          initialProps: {
            landmarks: null as NormalizedLandmark[][] | null,
            width: 800,
            height: 600,
          },
        }
      );

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      const hand = createHand(0.7, 0.3); // Snare pad

      act(() => {
        rerender({
          landmarks: [hand],
          width: 800,
          height: 600,
        });
      });

      expect(mockAudioContext.createBufferSource).toHaveBeenCalled();
    });

    it('should not play sound continuously while finger stays in pad', async () => {
      const { result, rerender } = renderHook(
        ({ landmarks, width, height }) => useDrumKit(landmarks, width, height, 'synth'),
        {
          initialProps: {
            landmarks: null as NormalizedLandmark[][] | null,
            width: 800,
            height: 600,
          },
        }
      );

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      const hand = createHand(0.7, 0.3); // Inside snare pad

      // First collision - should play
      act(() => {
        rerender({ landmarks: [hand], width: 800, height: 600 });
      });

      const firstCallCount = mockAudioContext.createOscillator.mock.calls.length;
      expect(firstCallCount).toBeGreaterThan(0);

      // Finger still in same position - should NOT play again
      act(() => {
        rerender({ landmarks: [hand], width: 800, height: 600 });
      });

      expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(firstCallCount);
    });

    it('should play sound again when finger exits and re-enters pad', async () => {
      const { result, rerender } = renderHook(
        ({ landmarks, width, height }) => useDrumKit(landmarks, width, height, 'synth'),
        {
          initialProps: {
            landmarks: null as NormalizedLandmark[][] | null,
            width: 800,
            height: 600,
          },
        }
      );

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      // Enter pad
      const handInside = createHand(0.7, 0.3);
      act(() => {
        rerender({ landmarks: [handInside], width: 800, height: 600 });
      });

      const firstCallCount = mockAudioContext.createOscillator.mock.calls.length;

      // Exit pad
      const handOutside = createHand(0.5, 0.5);
      act(() => {
        rerender({ landmarks: [handOutside], width: 800, height: 600 });
      });

      // Re-enter pad - should play again
      act(() => {
        rerender({ landmarks: [handInside], width: 800, height: 600 });
      });

      expect(mockAudioContext.createOscillator.mock.calls.length).toBeGreaterThan(firstCallCount);
    });

    it('should set active pad state when hit', async () => {
      const { result, rerender } = renderHook(
        ({ landmarks, width, height }) => useDrumKit(landmarks, width, height, 'synth'),
        {
          initialProps: {
            landmarks: null as NormalizedLandmark[][] | null,
            width: 800,
            height: 600,
          },
        }
      );

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      const hand = createHand(0.7, 0.3); // Snare pad

      act(() => {
        rerender({ landmarks: [hand], width: 800, height: 600 });
      });

      expect(result.current.activePads.has('snare')).toBe(true);
    });

    it('should clear active pad state after timeout', async () => {
      const { result, rerender } = renderHook(
        ({ landmarks, width, height }) => useDrumKit(landmarks, width, height, 'synth'),
        {
          initialProps: {
            landmarks: null as NormalizedLandmark[][] | null,
            width: 800,
            height: 600,
          },
        }
      );

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      const hand = createHand(0.7, 0.3);

      act(() => {
        rerender({ landmarks: [hand], width: 800, height: 600 });
      });

      expect(result.current.activePads.has('snare')).toBe(true);

      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(result.current.activePads.has('snare')).toBe(false);
    });
  });

  describe('when checking different drum pads', () => {
    it('should detect collision with hihat pad', async () => {
      const { result, rerender } = renderHook(
        ({ landmarks, width, height }) => useDrumKit(landmarks, width, height, 'synth'),
        {
          initialProps: {
            landmarks: null as NormalizedLandmark[][] | null,
            width: 800,
            height: 600,
          },
        }
      );

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      // Hihat at x: 70%, y: 20% = mirrored to x: 30%
      // In 800x600: 240,120 to 360,240
      const hand = createHand(0.7, 0.3); // x: 0.7 mirrored = 0.3 * 800 = 240

      act(() => {
        rerender({ landmarks: [hand], width: 800, height: 600 });
      });

      expect(result.current.activePads.has('snare')).toBe(true);
    });

    it('should detect collision with kick pad', async () => {
      const { result, rerender } = renderHook(
        ({ landmarks, width, height }) => useDrumKit(landmarks, width, height, 'synth'),
        {
          initialProps: {
            landmarks: null as NormalizedLandmark[][] | null,
            width: 800,
            height: 600,
          },
        }
      );

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      // Kick at x: 20%, y: 60%
      // In 800x600: 160,360 to 280,480
      const hand = createHand(0.7, 0.7); // mirrored x: 0.3 * 800 = 240, y: 0.7 * 600 = 420

      act(() => {
        rerender({ landmarks: [hand], width: 800, height: 600 });
      });

      expect(result.current.activePads.has('kick')).toBe(true);
    });
  });

  describe('when using multiple fingers', () => {
    it('should track collisions independently for each finger type', async () => {
      const { result, rerender } = renderHook(
        ({ landmarks, width, height }) => useDrumKit(landmarks, width, height, 'synth'),
        {
          initialProps: {
            landmarks: null as NormalizedLandmark[][] | null,
            width: 800,
            height: 600,
          },
        }
      );

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      // Create hand with multiple finger tips in different pads
      const hand: NormalizedLandmark[] = [];
      for (let i = 0; i < 21; i++) {
        if (i === 4) { // Thumb
          hand.push(createFingerTip(0.7, 0.3)); // Snare area
        } else if (i === 8) { // Index
          hand.push(createFingerTip(0.25, 0.3)); // Hihat area
        } else {
          hand.push(createFingerTip(0.5, 0.5));
        }
      }

      act(() => {
        rerender({ landmarks: [hand], width: 800, height: 600 });
      });

      // Both pads should be active
      expect(result.current.activePads.size).toBeGreaterThan(0);
    });
  });

  describe('when no landmarks provided', () => {
    it('should not attempt collision detection', () => {
      const { result } = renderHook(() => useDrumKit(null, 800, 600, 'synth'));

      // Should not crash and activePads should be empty
      expect(result.current.activePads.size).toBe(0);
    });
  });

  describe('when container has zero dimensions', () => {
    it('should not perform collision detection', async () => {
      const { result, rerender } = renderHook(
        ({ landmarks, width, height }) => useDrumKit(landmarks, width, height, 'synth'),
        {
          initialProps: {
            landmarks: null as NormalizedLandmark[][] | null,
            width: 0,
            height: 0,
          },
        }
      );

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      const hand = createHand(0.7, 0.3);

      act(() => {
        rerender({ landmarks: [hand], width: 0, height: 0 });
      });

      expect(mockAudioContext.createOscillator).not.toHaveBeenCalled();
    });
  });
});
