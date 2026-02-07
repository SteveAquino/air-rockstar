import { useState, useEffect, useRef, useCallback } from 'react';

export type PermissionState = 'prompt' | 'granted' | 'denied';

export interface CameraState {
  stream: MediaStream | null;
  permissionState: PermissionState;
  isRequesting: boolean;
  error: string | null;
}

export interface UseCameraReturn extends CameraState {
  requestCamera: () => Promise<void>;
  stopCamera: () => void;
}

const CAMERA_CONSTRAINTS: MediaStreamConstraints = {
  video: {
    width: 640,
    height: 480,
    facingMode: 'user',
  },
};

export function useCamera(): UseCameraReturn {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [permissionState, setPermissionState] =
    useState<PermissionState>('prompt');
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setStream(null);
    }
  }, []);

  const requestCamera = useCallback(async () => {
    setIsRequesting(true);
    setError(null);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia(
        CAMERA_CONSTRAINTS
      );

      streamRef.current = mediaStream;
      setStream(mediaStream);
      setPermissionState('granted');
      setError(null);
    } catch (err) {
      const error = err as Error & { name: string };

      if (error.name === 'NotAllowedError') {
        setPermissionState('denied');
        setError(
          'Camera access denied. Click the camera icon in your browser\'s address bar to enable access.'
        );
      } else if (error.name === 'NotFoundError') {
        setError(
          'No camera detected. Please connect a camera and refresh the page.'
        );
      } else if (error.name === 'NotReadableError') {
        setError(
          'Camera is being used by another application. Please close other apps and try again.'
        );
      } else {
        setError('Unable to access camera. Please try again.');
      }
    } finally {
      setIsRequesting(false);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    stream,
    permissionState,
    isRequesting,
    error,
    requestCamera,
    stopCamera,
  };
}
