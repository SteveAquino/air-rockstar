import { renderHook, act, waitFor } from '@testing-library/react';
import { useCamera } from '../../src/hooks/useCamera';

// Mock navigator.mediaDevices
const mockGetUserMedia = jest.fn();
const mockPermissionsQuery = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  
  Object.defineProperty(global.navigator, 'mediaDevices', {
    writable: true,
    value: {
      getUserMedia: mockGetUserMedia,
    },
  });

  Object.defineProperty(global.navigator, 'permissions', {
    writable: true,
    value: {
      query: mockPermissionsQuery,
    },
  });
});

describe('useCamera', () => {
  describe('when initialized', () => {
    it('should have null stream', () => {
      const { result } = renderHook(() => useCamera());
      
      expect(result.current.stream).toBeNull();
    });

    it('should have prompt permission state', () => {
      const { result } = renderHook(() => useCamera());
      
      expect(result.current.permissionState).toBe('prompt');
    });

    it('should not be requesting', () => {
      const { result } = renderHook(() => useCamera());
      
      expect(result.current.isRequesting).toBe(false);
    });

    it('should have no error', () => {
      const { result } = renderHook(() => useCamera());
      
      expect(result.current.error).toBeNull();
    });
  });

  describe('when requestCamera is called', () => {
    it('should set isRequesting to true', async () => {
      mockGetUserMedia.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      const { result } = renderHook(() => useCamera());

      act(() => {
        result.current.requestCamera();
      });

      expect(result.current.isRequesting).toBe(true);
    });

    it('should call getUserMedia with video constraints', async () => {
      const mockStream = { getTracks: jest.fn(() => []) };
      mockGetUserMedia.mockResolvedValue(mockStream);

      const { result } = renderHook(() => useCamera());

      await act(async () => {
        await result.current.requestCamera();
      });

      expect(mockGetUserMedia).toHaveBeenCalledWith({
        video: {
          width: 640,
          height: 480,
          facingMode: 'user',
        },
      });
    });
  });

  describe('when camera permission is granted', () => {
    it('should set stream', async () => {
      const mockStream = { getTracks: jest.fn(() => []) };
      mockGetUserMedia.mockResolvedValue(mockStream);

      const { result } = renderHook(() => useCamera());

      await act(async () => {
        await result.current.requestCamera();
      });

      await waitFor(() => {
        expect(result.current.stream).toBe(mockStream);
      });
    });

    it('should set permission state to granted', async () => {
      const mockStream = { getTracks: jest.fn(() => []) };
      mockGetUserMedia.mockResolvedValue(mockStream);

      const { result } = renderHook(() => useCamera());

      await act(async () => {
        await result.current.requestCamera();
      });

      await waitFor(() => {
        expect(result.current.permissionState).toBe('granted');
      });
    });

    it('should set isRequesting to false', async () => {
      const mockStream = { getTracks: jest.fn(() => []) };
      mockGetUserMedia.mockResolvedValue(mockStream);

      const { result } = renderHook(() => useCamera());

      await act(async () => {
        await result.current.requestCamera();
      });

      await waitFor(() => {
        expect(result.current.isRequesting).toBe(false);
      });
    });

    it('should clear any previous error', async () => {
      const mockStream = { getTracks: jest.fn(() => []) };
      mockGetUserMedia.mockResolvedValue(mockStream);

      const { result } = renderHook(() => useCamera());

      await act(async () => {
        await result.current.requestCamera();
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });
  });

  describe('when camera permission is denied', () => {
    it('should set permission state to denied', async () => {
      const error = new Error('Permission denied');
      error.name = 'NotAllowedError';
      mockGetUserMedia.mockRejectedValue(error);

      const { result } = renderHook(() => useCamera());

      await act(async () => {
        await result.current.requestCamera();
      });

      await waitFor(() => {
        expect(result.current.permissionState).toBe('denied');
      });
    });

    it('should set error message', async () => {
      const error = new Error('Permission denied');
      error.name = 'NotAllowedError';
      mockGetUserMedia.mockRejectedValue(error);

      const { result } = renderHook(() => useCamera());

      await act(async () => {
        await result.current.requestCamera();
      });

      await waitFor(() => {
        expect(result.current.error).toContain('denied');
      });
    });

    it('should set isRequesting to false', async () => {
      const error = new Error('Permission denied');
      error.name = 'NotAllowedError';
      mockGetUserMedia.mockRejectedValue(error);

      const { result } = renderHook(() => useCamera());

      await act(async () => {
        await result.current.requestCamera();
      });

      await waitFor(() => {
        expect(result.current.isRequesting).toBe(false);
      });
    });

    it('should not set stream', async () => {
      const error = new Error('Permission denied');
      error.name = 'NotAllowedError';
      mockGetUserMedia.mockRejectedValue(error);

      const { result } = renderHook(() => useCamera());

      await act(async () => {
        await result.current.requestCamera();
      });

      await waitFor(() => {
        expect(result.current.stream).toBeNull();
      });
    });
  });

  describe('when camera is not found', () => {
    it('should set appropriate error message', async () => {
      const error = new Error('No camera found');
      error.name = 'NotFoundError';
      mockGetUserMedia.mockRejectedValue(error);

      const { result } = renderHook(() => useCamera());

      await act(async () => {
        await result.current.requestCamera();
      });

      await waitFor(() => {
        expect(result.current.error).toContain('camera');
      });
    });
  });

  describe('when camera is in use by another app', () => {
    it('should set appropriate error message', async () => {
      const error = new Error('Camera in use');
      error.name = 'NotReadableError';
      mockGetUserMedia.mockRejectedValue(error);

      const { result } = renderHook(() => useCamera());

      await act(async () => {
        await result.current.requestCamera();
      });

      await waitFor(() => {
        expect(result.current.error).toContain('another application');
      });
    });
  });

  describe('when an unknown error occurs', () => {
    it('should set generic error message', async () => {
      const error = new Error('Unknown error');
      error.name = 'UnknownError';
      mockGetUserMedia.mockRejectedValue(error);

      const { result } = renderHook(() => useCamera());

      await act(async () => {
        await result.current.requestCamera();
      });

      await waitFor(() => {
        expect(result.current.error).toContain('Unable to access');
      });
    });
  });

  describe('when stopCamera is called', () => {
    it('should stop all tracks', async () => {
      const mockTrack = { stop: jest.fn() };
      const mockStream = { getTracks: jest.fn(() => [mockTrack]) };
      mockGetUserMedia.mockResolvedValue(mockStream);

      const { result } = renderHook(() => useCamera());

      await act(async () => {
        await result.current.requestCamera();
      });

      await waitFor(() => {
        expect(result.current.stream).toBe(mockStream);
      });

      act(() => {
        result.current.stopCamera();
      });

      expect(mockTrack.stop).toHaveBeenCalled();
    });

    it('should set stream to null', async () => {
      const mockTrack = { stop: jest.fn() };
      const mockStream = { getTracks: jest.fn(() => [mockTrack]) };
      mockGetUserMedia.mockResolvedValue(mockStream);

      const { result } = renderHook(() => useCamera());

      await act(async () => {
        await result.current.requestCamera();
      });

      await waitFor(() => {
        expect(result.current.stream).toBe(mockStream);
      });

      act(() => {
        result.current.stopCamera();
      });

      expect(result.current.stream).toBeNull();
    });
  });

  describe('when component unmounts', () => {
    it('should stop camera stream', async () => {
      const mockTrack = { stop: jest.fn() };
      const mockStream = { getTracks: jest.fn(() => [mockTrack]) };
      mockGetUserMedia.mockResolvedValue(mockStream);

      const { result, unmount } = renderHook(() => useCamera());

      await act(async () => {
        await result.current.requestCamera();
      });

      await waitFor(() => {
        expect(result.current.stream).toBe(mockStream);
      });

      unmount();

      expect(mockTrack.stop).toHaveBeenCalled();
    });
  });
});
