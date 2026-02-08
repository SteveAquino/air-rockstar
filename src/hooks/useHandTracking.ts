import { useEffect, useRef, useState, RefObject } from 'react';
import { Hands, Results } from '@mediapipe/hands';
import type {
  HandLandmark,
  HandTrackingState,
  UseHandTrackingOptions,
} from '@/src/types/handTracking';

export type {
  HandLandmark,
  HandTrackingState,
  UseHandTrackingOptions,
} from '@/src/types/handTracking';

const getDrawOptions = (
  landmarkRadius?: number,
  landmarkColor?: string,
  connectionColor?: string,
  connectionWidth?: number
) => ({
  landmarkRadius,
  landmarkColor,
  connectionColor,
  connectionWidth,
});

export function useHandTracking(
  videoRef: RefObject<HTMLVideoElement>,
  canvasRef: RefObject<HTMLCanvasElement>,
  enabled: boolean,
  options: UseHandTrackingOptions = {}
): HandTrackingState {
  const [landmarks, setLandmarks] = useState<HandLandmark[][] | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handsRef = useRef<Hands | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const drawOptionsRef = useRef({
    landmarkRadius: options.landmarkRadius,
    landmarkColor: options.landmarkColor,
    connectionColor: options.connectionColor,
    connectionWidth: options.connectionWidth,
  });

  const {
    landmarkRadius,
    landmarkColor,
    connectionColor,
    connectionWidth,
  } = options;

  useEffect(() => {
    drawOptionsRef.current = getDrawOptions(
      landmarkRadius,
      landmarkColor,
      connectionColor,
      connectionWidth
    );
  }, [landmarkRadius, landmarkColor, connectionColor, connectionWidth]);

  useEffect(() => {
    if (!enabled || !videoRef.current || !canvasRef.current) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      setError('Cannot get canvas context');
      return;
    }

    let isActive = true;

    const initializeHands = async () => {
      try {
        setIsProcessing(true);
        setError(null);

        const hands = new Hands({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
          },
        });

        hands.setOptions({
          maxNumHands: options.maxNumHands ?? 2,
          modelComplexity: options.modelComplexity ?? 1,
          minDetectionConfidence: options.minDetectionConfidence ?? 0.5,
          minTrackingConfidence: options.minTrackingConfidence ?? 0.5,
        });

        hands.onResults((results: Results) => {
          if (!isActive) return;

          // Clear canvas
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Extract landmarks
          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const allHandsLandmarks = results.multiHandLandmarks.map(handLandmarks => 
              handLandmarks.map(lm => ({
                x: lm.x,
                y: lm.y,
                z: lm.z,
              }))
            );
            setLandmarks(allHandsLandmarks);

            // Draw landmarks
            drawLandmarks(
              ctx,
              results,
              canvas.width,
              canvas.height,
              drawOptionsRef.current
            );
          } else {
            setLandmarks(null);
          }
        });

        await hands.initialize();
        handsRef.current = hands;

        // Start processing loop
        const processFrame = async () => {
          if (!isActive || !handsRef.current) return;

          try {
            await handsRef.current.send({ image: video });
          } catch (err) {
            console.error('Error processing frame:', err);
          }

          if (isActive) {
            animationFrameRef.current = requestAnimationFrame(processFrame);
          }
        };

        processFrame();
      } catch (err) {
        if (isActive) {
          setError(err instanceof Error ? err.message : 'Failed to initialize hand tracking');
          setIsProcessing(false);
        }
      }
    };

    initializeHands();

    return () => {
      isActive = false;
      setIsProcessing(false);
      
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      if (handsRef.current) {
        handsRef.current.close();
        handsRef.current = null;
      }
    };
  }, [
    enabled,
    videoRef,
    canvasRef,
    options.maxNumHands,
    options.modelComplexity,
    options.minDetectionConfidence,
    options.minTrackingConfidence,
  ]);

  return { landmarks, isProcessing, error };
}

function drawLandmarks(
  ctx: CanvasRenderingContext2D,
  results: Results,
  width: number,
  height: number,
  options: {
    landmarkRadius?: number;
    landmarkColor?: string;
    connectionColor?: string;
    connectionWidth?: number;
  }
) {
  if (!results.multiHandLandmarks) return;
  const landmarkRadius = options.landmarkRadius ?? 4;
  const landmarkColor = options.landmarkColor ?? 'rgba(138, 240, 217, 0.95)';
  const connectionColor = options.connectionColor ?? 'rgba(245, 242, 255, 0.35)';
  const connectionWidth = options.connectionWidth ?? 2;

  // Draw connections (lines between landmarks)
  const HAND_CONNECTIONS = [
    [0, 1], [1, 2], [2, 3], [3, 4],  // Thumb
    [0, 5], [5, 6], [6, 7], [7, 8],  // Index
    [0, 9], [9, 10], [10, 11], [11, 12],  // Middle
    [0, 13], [13, 14], [14, 15], [15, 16],  // Ring
    [0, 17], [17, 18], [18, 19], [19, 20],  // Pinky
    [5, 9], [9, 13], [13, 17],  // Palm
  ];

  for (const handLandmarks of results.multiHandLandmarks) {
    // Draw connections
    ctx.strokeStyle = connectionColor;
    ctx.lineWidth = connectionWidth;
    
    for (const [start, end] of HAND_CONNECTIONS) {
      const startLm = handLandmarks[start];
      const endLm = handLandmarks[end];
      
      ctx.beginPath();
      ctx.moveTo(startLm.x * width, startLm.y * height);
      ctx.lineTo(endLm.x * width, endLm.y * height);
      ctx.stroke();
    }

    // Draw landmarks
    ctx.fillStyle = landmarkColor;
    for (const landmark of handLandmarks) {
      ctx.beginPath();
      ctx.arc(
        landmark.x * width,
        landmark.y * height,
        landmarkRadius,
        0,
        2 * Math.PI
      );
      ctx.fill();
    }
  }
}
