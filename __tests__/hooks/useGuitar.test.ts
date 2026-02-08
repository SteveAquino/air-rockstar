import { act, renderHook, waitFor } from '@testing-library/react';
import { useGuitar } from '../../src/hooks/useGuitar';
import type { NormalizedLandmark } from '@mediapipe/hands';

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
  destination: {},
  currentTime: 0,
  state: 'running',
  resume: jest.fn(),
  close: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  (global as any).AudioContext = jest.fn(() => mockAudioContext);
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

const createFingerTip = (x: number, y: number): NormalizedLandmark => ({
  x,
  y,
  z: 0,
  visibility: 1,
});

const createHandWithTip = (
  fingerIndex: number,
  x: number,
  y: number
): NormalizedLandmark[] => {
  const hand: NormalizedLandmark[] = [];
  for (let i = 0; i < 21; i++) {
    if (i === fingerIndex) {
      hand.push(createFingerTip(x, y));
    } else {
      hand.push(createFingerTip(0.5, 0.5));
    }
  }
  return hand;
};

describe('useGuitar', () => {
  describe('when initialized', () => {
    it('when initialized, should initialize Web Audio API and set isReady to true', async () => {
      const { result } = renderHook(() => useGuitar(null, 800, 600));

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });

      expect(global.AudioContext).toHaveBeenCalled();
    });

    it('when initialized, should return 6 guitar strings in standard tuning order', () => {
      const { result } = renderHook(() => useGuitar(null, 800, 600));

      expect(result.current.strings).toHaveLength(6);
      expect(result.current.strings.map((string) => string.note)).toEqual([
        'E4',
        'B3',
        'G3',
        'D3',
        'A2',
        'E2',
      ]);
    });

    it('when initialized, should initialize with empty active strings', () => {
      const { result } = renderHook(() => useGuitar(null, 800, 600));

      expect(result.current.activeStrings.size).toBe(0);
    });

    it('when initialized, should cleanup audio context on unmount', async () => {
      const { unmount } = renderHook(() => useGuitar(null, 800, 600));

      await waitFor(() => {
        expect(mockAudioContext.close).not.toHaveBeenCalled();
      });

      unmount();

      expect(mockAudioContext.close).toHaveBeenCalled();
    });
  });

  describe('when finger collides with a string', () => {
    it('when finger collides, should play a pluck on entry', async () => {
      const { result, rerender } = renderHook(
        ({ landmarks, width, height }) => useGuitar(landmarks, width, height),
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

      const hand = createHandWithTip(8, 0.5, 0.67);

      act(() => {
        rerender({ landmarks: [hand], width: 800, height: 600 });
      });

      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    });

    it('when finger stays inside the band, should not retrigger', async () => {
      const { result, rerender } = renderHook(
        ({ landmarks, width, height }) => useGuitar(landmarks, width, height),
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

      const hand = createHandWithTip(8, 0.5, 0.67);

      act(() => {
        rerender({ landmarks: [hand], width: 800, height: 600 });
      });

      const firstCallCount = mockAudioContext.createOscillator.mock.calls.length;

      act(() => {
        rerender({ landmarks: [hand], width: 800, height: 600 });
      });

      expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(
        firstCallCount
      );
    });

    it('when finger re-enters after cooldown, should retrigger', async () => {
      const { result, rerender } = renderHook(
        ({ landmarks, width, height }) =>
          useGuitar(landmarks, width, height, { cooldownMs: 200 }),
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

      const inside = createHandWithTip(8, 0.5, 0.67);
      const outside = createHandWithTip(8, 0.5, 0.5);

      act(() => {
        rerender({ landmarks: [inside], width: 800, height: 600 });
      });

      act(() => {
        rerender({ landmarks: [outside], width: 800, height: 600 });
      });

      act(() => {
        jest.advanceTimersByTime(200);
      });

      act(() => {
        rerender({ landmarks: [inside], width: 800, height: 600 });
      });

      expect(mockAudioContext.createOscillator.mock.calls.length).toBeGreaterThan(
        1
      );
    });

    it('when string is hit, should set active string state', async () => {
      const { result, rerender } = renderHook(
        ({ landmarks, width, height }) => useGuitar(landmarks, width, height),
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

      const hand = createHandWithTip(8, 0.5, 0.67);

      act(() => {
        rerender({ landmarks: [hand], width: 800, height: 600 });
      });

      expect(result.current.activeStrings.size).toBeGreaterThan(0);
    });

    it('when audio is suspended, should resume before playing', async () => {
      mockAudioContext.state = 'suspended';

      const { result, rerender } = renderHook(
        ({ landmarks, width, height }) => useGuitar(landmarks, width, height),
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

      const hand = createHandWithTip(8, 0.5, 0.67);

      act(() => {
        rerender({ landmarks: [hand], width: 800, height: 600 });
      });

      expect(mockAudioContext.resume).toHaveBeenCalled();
      mockAudioContext.state = 'running';
    });
  });

  describe('when container has zero dimensions', () => {
    it('when container has zero dimensions, should not perform collision detection', async () => {
      const { result, rerender } = renderHook(
        ({ landmarks, width, height }) =>
          useGuitar(landmarks, width, height, { stringSpacing: 1 }),
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

      const hand = createHandWithTip(8, 0.5, 0.01);

      act(() => {
        rerender({ landmarks: [hand], width: 0, height: 0 });
      });

      expect(mockAudioContext.createOscillator).not.toHaveBeenCalled();
    });
  });
});
