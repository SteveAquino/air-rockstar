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

const getStringY = (
  strings: Array<{ id: string; yPercent: number }>,
  stringId = 'e4'
) => {
  const target = strings.find((string) => string.id === stringId);
  return (target?.yPercent ?? 50) / 100;
};

const getExpectedFret = (
  x: number,
  width: number,
  fretZoneWidthRatio: number,
  fretCount: number
) => {
  const fingerX = (1 - x) * width;
  const fretZoneMaxX = width * fretZoneWidthRatio;
  const raw = (fingerX / Math.max(fretZoneMaxX, 1)) * fretCount;
  return Math.max(1, Math.min(fretCount, Math.floor(raw) + 1));
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

      const stringY = getStringY(result.current.strings);
      const hand = createHandWithTip(8, 0.2, stringY);

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

      const stringY = getStringY(result.current.strings);
      const hand = createHandWithTip(8, 0.2, stringY);

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

      const stringY = getStringY(result.current.strings);
      const inside = createHandWithTip(8, 0.2, stringY);
      const outside = createHandWithTip(8, 0.2, 0.5);

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

      const stringY = getStringY(result.current.strings);
      const hand = createHandWithTip(8, 0.2, stringY);

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

      const stringY = getStringY(result.current.strings);
      const hand = createHandWithTip(8, 0.2, stringY);

      act(() => {
        rerender({ landmarks: [hand], width: 800, height: 600 });
      });

      expect(mockAudioContext.resume).toHaveBeenCalled();
      mockAudioContext.state = 'running';
    });
  });

  describe('when fretting a string', () => {
    it('when finger is in the fret zone, should set the fret for the string', async () => {
      const fretZoneWidthRatio = 0.67;
      const fretCount = 5;
      const { result, rerender } = renderHook(
        ({ landmarks, width, height }) =>
          useGuitar(landmarks, width, height, {
            fretCount,
            fretZoneWidthRatio,
          }),
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

      const stringY = getStringY(result.current.strings);
      const frettingHand = createHandWithTip(8, 0.95, stringY);

      act(() => {
        rerender({ landmarks: [frettingHand], width: 800, height: 600 });
      });

      const expectedFret = getExpectedFret(
        0.95,
        800,
        fretZoneWidthRatio,
        fretCount
      );
      expect(result.current.frettedStrings.e4).toBe(expectedFret);
    });

    it('when strumming with a fret applied, should modulate pitch', async () => {
      const fretZoneWidthRatio = 0.67;
      const fretCount = 5;
      const { result, rerender } = renderHook(
        ({ landmarks, width, height }) =>
          useGuitar(landmarks, width, height, {
            fretCount,
            fretZoneWidthRatio,
          }),
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

      const stringY = getStringY(result.current.strings);
      const frettingHand = createHandWithTip(8, 0.82, stringY);
      const strummingHand = createHandWithTip(8, 0.2, stringY);

      act(() => {
        rerender({
          landmarks: [frettingHand, strummingHand],
          width: 800,
          height: 600,
        });
      });

      const oscillator = mockAudioContext.createOscillator.mock.results[0]?.value;
      expect(oscillator).toBeDefined();
      const expectedFret = getExpectedFret(
        0.82,
        800,
        fretZoneWidthRatio,
        fretCount
      );
      const expectedFrequency = 329.63 * Math.pow(2, expectedFret / 12);
      expect(oscillator.frequency.value).toBeCloseTo(expectedFrequency, 2);
    });

    it('when moving to a lower fret, should update the fret down', async () => {
      const fretZoneWidthRatio = 0.67;
      const fretCount = 5;
      const { result, rerender } = renderHook(
        ({ landmarks, width, height }) =>
          useGuitar(landmarks, width, height, {
            fretCount,
            fretZoneWidthRatio,
          }),
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

      const stringY = getStringY(result.current.strings);
      const highFretHand = createHandWithTip(8, 0.6, stringY);
      const lowFretHand = createHandWithTip(8, 0.8, stringY);

      act(() => {
        rerender({ landmarks: [highFretHand], width: 800, height: 600 });
      });

      const highFret = getExpectedFret(
        0.6,
        800,
        fretZoneWidthRatio,
        fretCount
      );
      expect(result.current.frettedStrings.e4).toBe(highFret);

      act(() => {
        rerender({ landmarks: [lowFretHand], width: 800, height: 600 });
      });

      const lowFret = getExpectedFret(
        0.8,
        800,
        fretZoneWidthRatio,
        fretCount
      );
      expect(result.current.frettedStrings.e4).toBe(lowFret);
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
