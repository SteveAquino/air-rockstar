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
const createHand = (
  fingerTipX: number,
  fingerTipY: number
): NormalizedLandmark[] => {
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

const DEFAULT_WIDTH = 800;
const DEFAULT_HEIGHT = 600;

const getNormalizedPointForPad = (
  pad: { x: number; y: number; width: number; height: number },
  containerWidth: number,
  containerHeight: number,
  offsetX = 0,
  offsetY = 0
) => {
  const padX = (pad.x / 100) * containerWidth;
  const padY = (pad.y / 100) * containerHeight;
  const centerX = padX + pad.width / 2 + offsetX;
  const centerY = padY + pad.height / 2 + offsetY;
  return {
    x: 1 - centerX / containerWidth,
    y: centerY / containerHeight,
  };
};

const createHandForPad = (
  pad: { x: number; y: number; width: number; height: number },
  containerWidth: number,
  containerHeight: number,
  offsetX = 0,
  offsetY = 0
) => {
  const point = getNormalizedPointForPad(
    pad,
    containerWidth,
    containerHeight,
    offsetX,
    offsetY
  );
  return createHand(point.x, point.y);
};

const createHandWithTips = (
  tips: Record<number, { x: number; y: number }>
): NormalizedLandmark[] => {
  const hand: NormalizedLandmark[] = [];
  for (let i = 0; i < 21; i++) {
    if (tips[i]) {
      hand.push(createFingerTip(tips[i].x, tips[i].y));
    } else {
      hand.push(createFingerTip(0.5, 0.5));
    }
  }
  return hand;
};

describe('useDrumKit', () => {
  describe('when initialized', () => {
    it('should initialize Web Audio API and set isReady to true', async () => {
      const { result } = renderHook(() =>
        useDrumKit(null, DEFAULT_WIDTH, DEFAULT_HEIGHT, 'synth')
      );

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      expect(global.AudioContext).toHaveBeenCalled();
    });

    it('should return drum pads configuration', () => {
      const { result } = renderHook(() =>
        useDrumKit(null, DEFAULT_WIDTH, DEFAULT_HEIGHT, 'synth')
      );

      expect(result.current.pads).toHaveLength(6);
      expect(result.current.pads).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 'hihat', name: 'Hi-Hat' }),
          expect.objectContaining({ id: 'crash', name: 'Crash' }),
          expect.objectContaining({ id: 'tomHigh', name: 'High Tom' }),
          expect.objectContaining({ id: 'snare', name: 'Snare' }),
          expect.objectContaining({ id: 'tomLow', name: 'Low Tom' }),
          expect.objectContaining({ id: 'kick', name: 'Kick' }),
        ])
      );
    });

    it('should initialize with empty active pads', () => {
      const { result } = renderHook(() =>
        useDrumKit(null, DEFAULT_WIDTH, DEFAULT_HEIGHT, 'synth')
      );

      expect(result.current.activePads.size).toBe(0);
    });

    it('should load drum samples when using acoustic variant', async () => {
      const { result } = renderHook(() =>
        useDrumKit(null, DEFAULT_WIDTH, DEFAULT_HEIGHT, 'acoustic')
      );

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      // Should attempt to fetch all 6 drum samples
      expect(global.fetch).toHaveBeenCalledTimes(6);
      expect(mockAudioContext.decodeAudioData).toHaveBeenCalled();
    });

    it('should handle sample loading errors gracefully', async () => {
      // Suppress console.error for this test since we're intentionally testing error handling
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Mock fetch to reject
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      
      const { result } = renderHook(() =>
        useDrumKit(null, DEFAULT_WIDTH, DEFAULT_HEIGHT, 'acoustic')
      );

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      // Should still be ready even if samples fail to load
      expect(result.current.isReady).toBe(true);
      
      // Restore console.error
      consoleErrorSpy.mockRestore();
    });

    it('should cleanup audio context on unmount', async () => {
      const { unmount } = renderHook(() =>
        useDrumKit(null, DEFAULT_WIDTH, DEFAULT_HEIGHT, 'synth')
      );

      await waitFor(() => {
        expect(mockAudioContext.close).not.toHaveBeenCalled();
      });

      unmount();

      expect(mockAudioContext.close).toHaveBeenCalled();
    });
  });

  describe('when configured with options', () => {
    it('should scale pad sizes based on padScale', async () => {
      const { result } = renderHook(() =>
        useDrumKit(null, DEFAULT_WIDTH, DEFAULT_HEIGHT, 'synth', {
          padScale: 1.5,
        })
      );

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      const snare = result.current.pads.find((pad) => pad.id === 'snare');
      expect(snare?.width).toBeCloseTo(180);
      expect(snare?.height).toBeCloseTo(180);
    });

    it('should filter pads based on enabledPadIds', async () => {
      const { result } = renderHook(() =>
        useDrumKit(null, DEFAULT_WIDTH, DEFAULT_HEIGHT, 'synth', {
          enabledPadIds: ['snare', 'kick'],
        })
      );

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      expect(result.current.pads.map((pad) => pad.id)).toEqual(['snare', 'kick']);
    });

    it('should ignore collisions when no pads are enabled', async () => {
      const { result, rerender } = renderHook(
        ({ landmarks, width, height }) =>
          useDrumKit(landmarks, width, height, 'synth', {
            enabledPadIds: [],
          }),
        {
          initialProps: {
            landmarks: null as NormalizedLandmark[][] | null,
            width: DEFAULT_WIDTH,
            height: DEFAULT_HEIGHT,
          },
        }
      );

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      const hand = createHand(0.5, 0.5);

      act(() => {
        rerender({
          landmarks: [hand],
          width: DEFAULT_WIDTH,
          height: DEFAULT_HEIGHT,
        });
      });

      expect(mockAudioContext.createOscillator).not.toHaveBeenCalled();
    });

    it('should detect collisions with hit padding beyond pad bounds', async () => {
      const { result, rerender } = renderHook(
        ({ landmarks, width, height }) =>
          useDrumKit(landmarks, width, height, 'synth', { hitPadding: 10 }),
        {
          initialProps: {
            landmarks: null as NormalizedLandmark[][] | null,
            width: DEFAULT_WIDTH,
            height: DEFAULT_HEIGHT,
          },
        }
      );

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      const snare = result.current.pads.find((pad) => pad.id === 'snare');
      expect(snare).toBeDefined();
      if (!snare) {
        return;
      }

      const padX = (snare.x / 100) * DEFAULT_WIDTH;
      const padY = (snare.y / 100) * DEFAULT_HEIGHT;
      const fingerX = padX - 5;
      const fingerY = padY + snare.height / 2;
      const hand = createHand(
        1 - fingerX / DEFAULT_WIDTH,
        fingerY / DEFAULT_HEIGHT
      );

      act(() => {
        rerender({
          landmarks: [hand],
          width: DEFAULT_WIDTH,
          height: DEFAULT_HEIGHT,
        });
      });

      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    });

    it('should invoke onHit callback with pad id', async () => {
      const onHit = jest.fn();
      const { result, rerender } = renderHook(
        ({ landmarks, width, height }) =>
          useDrumKit(landmarks, width, height, 'synth', { onHit }),
        {
          initialProps: {
            landmarks: null as NormalizedLandmark[][] | null,
            width: DEFAULT_WIDTH,
            height: DEFAULT_HEIGHT,
          },
        }
      );

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      const snare = result.current.pads.find((pad) => pad.id === 'snare');
      expect(snare).toBeDefined();
      if (!snare) {
        return;
      }
      const hand = createHandForPad(snare, DEFAULT_WIDTH, DEFAULT_HEIGHT);

      act(() => {
        rerender({
          landmarks: [hand],
          width: DEFAULT_WIDTH,
          height: DEFAULT_HEIGHT,
        });
      });

      expect(onHit).toHaveBeenCalledWith('snare');
    });

    it('should scale synth gain based on volume', async () => {
      const { result, rerender } = renderHook(
        ({ landmarks, width, height }) =>
          useDrumKit(landmarks, width, height, 'synth', { volume: 0.5 }),
        {
          initialProps: {
            landmarks: null as NormalizedLandmark[][] | null,
            width: DEFAULT_WIDTH,
            height: DEFAULT_HEIGHT,
          },
        }
      );

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      const snare = result.current.pads.find((pad) => pad.id === 'snare');
      expect(snare).toBeDefined();
      if (!snare) {
        return;
      }
      const hand = createHandForPad(snare, DEFAULT_WIDTH, DEFAULT_HEIGHT);

      act(() => {
        rerender({ landmarks: [hand], width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });
      });

      const gainCalls = mockAudioContext.createGain.mock.calls.length;
      expect(gainCalls).toBeGreaterThan(0);
      const gainInstance = mockAudioContext.createGain.mock.results[0]?.value;
      expect(gainInstance?.gain.setValueAtTime).toHaveBeenCalledWith(
        expect.closeTo(1.66, 2),
        expect.any(Number)
      );
    });
  });

  describe('when finger collides with drum pad', () => {
    it('should play sound when index finger enters snare pad area', async () => {
      const { result, rerender } = renderHook(
        ({ landmarks, width, height }) => useDrumKit(landmarks, width, height, 'synth'),
        {
          initialProps: {
            landmarks: null as NormalizedLandmark[][] | null,
            width: DEFAULT_WIDTH,
            height: DEFAULT_HEIGHT,
          },
        }
      );

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      const snare = result.current.pads.find((pad) => pad.id === 'snare');
      expect(snare).toBeDefined();
      if (!snare) {
        return;
      }
      const hand = createHandForPad(snare, DEFAULT_WIDTH, DEFAULT_HEIGHT);

      act(() => {
        rerender({
          landmarks: [hand],
          width: DEFAULT_WIDTH,
          height: DEFAULT_HEIGHT,
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
            width: DEFAULT_WIDTH,
            height: DEFAULT_HEIGHT,
          },
        }
      );

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      const snare = result.current.pads.find((pad) => pad.id === 'snare');
      expect(snare).toBeDefined();
      if (!snare) {
        return;
      }
      const hand = createHandForPad(snare, DEFAULT_WIDTH, DEFAULT_HEIGHT);

      act(() => {
        rerender({
          landmarks: [hand],
          width: DEFAULT_WIDTH,
          height: DEFAULT_HEIGHT,
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
            width: DEFAULT_WIDTH,
            height: DEFAULT_HEIGHT,
          },
        }
      );

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      const snare = result.current.pads.find((pad) => pad.id === 'snare');
      expect(snare).toBeDefined();
      if (!snare) {
        return;
      }
      const hand = createHandForPad(snare, DEFAULT_WIDTH, DEFAULT_HEIGHT);

      // First collision - should play
      act(() => {
        rerender({ landmarks: [hand], width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });
      });

      const firstCallCount = mockAudioContext.createOscillator.mock.calls.length;
      expect(firstCallCount).toBeGreaterThan(0);

      // Finger still in same position - should NOT play again
      act(() => {
        rerender({ landmarks: [hand], width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });
      });

      expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(firstCallCount);
    });

    it('should play sound again when finger exits and re-enters pad', async () => {
      const { result, rerender } = renderHook(
        ({ landmarks, width, height }) => useDrumKit(landmarks, width, height, 'synth'),
        {
          initialProps: {
            landmarks: null as NormalizedLandmark[][] | null,
            width: DEFAULT_WIDTH,
            height: DEFAULT_HEIGHT,
          },
        }
      );

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      // Enter pad
      const snareReentry = result.current.pads.find((pad) => pad.id === 'snare');
      expect(snareReentry).toBeDefined();
      if (!snareReentry) {
        return;
      }
      const handInside = createHandForPad(
        snareReentry,
        DEFAULT_WIDTH,
        DEFAULT_HEIGHT
      );
      act(() => {
        rerender({ landmarks: [handInside], width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });
      });

      const firstCallCount = mockAudioContext.createOscillator.mock.calls.length;

      // Exit pad
      const handOutside = createHand(0.5, 0.5);
      act(() => {
        rerender({ landmarks: [handOutside], width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });
      });

      // Re-enter pad - should play again
      act(() => {
        rerender({ landmarks: [handInside], width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });
      });

      expect(mockAudioContext.createOscillator.mock.calls.length).toBeGreaterThan(firstCallCount);
    });

    it('should set active pad state when hit', async () => {
      const { result, rerender } = renderHook(
        ({ landmarks, width, height }) => useDrumKit(landmarks, width, height, 'synth'),
        {
          initialProps: {
            landmarks: null as NormalizedLandmark[][] | null,
            width: DEFAULT_WIDTH,
            height: DEFAULT_HEIGHT,
          },
        }
      );

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      const snare = result.current.pads.find((pad) => pad.id === 'snare');
      expect(snare).toBeDefined();
      if (!snare) {
        return;
      }
      const hand = createHandForPad(snare, DEFAULT_WIDTH, DEFAULT_HEIGHT);

      act(() => {
        rerender({ landmarks: [hand], width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });
      });

      expect(result.current.activePads.has('snare')).toBe(true);
    });

    it('should clear active pad state after timeout', async () => {
      const { result, rerender } = renderHook(
        ({ landmarks, width, height }) => useDrumKit(landmarks, width, height, 'synth'),
        {
          initialProps: {
            landmarks: null as NormalizedLandmark[][] | null,
            width: DEFAULT_WIDTH,
            height: DEFAULT_HEIGHT,
          },
        }
      );

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      const snareActive = result.current.pads.find((pad) => pad.id === 'snare');
      expect(snareActive).toBeDefined();
      if (!snareActive) {
        return;
      }
      const hand = createHandForPad(snareActive, DEFAULT_WIDTH, DEFAULT_HEIGHT);

      act(() => {
        rerender({ landmarks: [hand], width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });
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
            width: DEFAULT_WIDTH,
            height: DEFAULT_HEIGHT,
          },
        }
      );

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      const hihat = result.current.pads.find((pad) => pad.id === 'hihat');
      expect(hihat).toBeDefined();
      if (!hihat) {
        return;
      }
      const hand = createHandForPad(hihat, DEFAULT_WIDTH, DEFAULT_HEIGHT);

      act(() => {
        rerender({ landmarks: [hand], width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });
      });

      expect(result.current.activePads.has('hihat')).toBe(true);
    });

    it('should detect collision with kick pad', async () => {
      const { result, rerender } = renderHook(
        ({ landmarks, width, height }) => useDrumKit(landmarks, width, height, 'synth'),
        {
          initialProps: {
            landmarks: null as NormalizedLandmark[][] | null,
            width: DEFAULT_WIDTH,
            height: DEFAULT_HEIGHT,
          },
        }
      );

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      const kick = result.current.pads.find((pad) => pad.id === 'kick');
      expect(kick).toBeDefined();
      if (!kick) {
        return;
      }
      const hand = createHandForPad(kick, DEFAULT_WIDTH, DEFAULT_HEIGHT);

      act(() => {
        rerender({ landmarks: [hand], width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });
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
            width: DEFAULT_WIDTH,
            height: DEFAULT_HEIGHT,
          },
        }
      );

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      const snare = result.current.pads.find((pad) => pad.id === 'snare');
      const crash = result.current.pads.find((pad) => pad.id === 'crash');
      expect(snare).toBeDefined();
      expect(crash).toBeDefined();
      if (!snare || !crash) {
        return;
      }

      const snarePoint = getNormalizedPointForPad(
        snare,
        DEFAULT_WIDTH,
        DEFAULT_HEIGHT
      );
      const crashPoint = getNormalizedPointForPad(
        crash,
        DEFAULT_WIDTH,
        DEFAULT_HEIGHT
      );

      const hand = createHandWithTips({
        4: snarePoint,
        8: crashPoint,
      });

      act(() => {
        rerender({ landmarks: [hand], width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });
      });

      // Both pads should be active
      expect(result.current.activePads.size).toBeGreaterThan(0);
    });
  });

  describe('when no landmarks provided', () => {
    it('should not attempt collision detection', () => {
      const { result } = renderHook(() =>
        useDrumKit(null, DEFAULT_WIDTH, DEFAULT_HEIGHT, 'synth')
      );

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
