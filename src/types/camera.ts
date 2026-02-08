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
