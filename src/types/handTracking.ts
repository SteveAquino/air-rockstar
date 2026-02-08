export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

export interface HandTrackingState {
  landmarks: HandLandmark[][] | null;
  isProcessing: boolean;
  error: string | null;
}

export interface UseHandTrackingOptions {
  maxNumHands?: number;
  modelComplexity?: 0 | 1;
  minDetectionConfidence?: number;
  minTrackingConfidence?: number;
  landmarkRadius?: number;
  landmarkColor?: string;
  connectionColor?: string;
  connectionWidth?: number;
}
