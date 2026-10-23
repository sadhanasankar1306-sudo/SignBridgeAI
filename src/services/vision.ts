import { predictSign, extractHandFeatures, SUPPORTED_SIGNS } from '../../ml/model.ts';
import type { PredictionResult } from '../types/index.ts';

// Hand connections according to MediaPipe Hands topology
export const HAND_CONNECTIONS = [
  // Thumb
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Index
  [0, 5], [5, 6], [6, 7], [7, 8],
  // Middle
  [0, 9], [9, 10], [10, 11], [11, 12],
  // Ring
  [0, 13], [13, 14], [14, 15], [15, 16],
  // Pinky
  [0, 17], [17, 18], [18, 19], [19, 20],
  // Palm base
  [5, 9], [9, 13], [13, 17]
];

export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

export class CameraVisionController {
  private videoElement: HTMLVideoElement | null = null;
  private canvasElement: HTMLCanvasElement | null = null;
  private mediaStream: MediaStream | null = null;
  private handsInstance: any = null;
  private isProcessing = false;
  private animationFrameId: number | null = null;
  private onPredictionCallback?: (result: PredictionResult, landmarks: HandLandmark[]) => void;
  private minConfidence = 0.70;

  constructor(
    video: HTMLVideoElement,
    canvas: HTMLCanvasElement,
    onPrediction: (result: PredictionResult, landmarks: HandLandmark[]) => void,
    minConfidence = 0.70
  ) {
    this.videoElement = video;
    this.canvasElement = canvas;
    this.onPredictionCallback = onPrediction;
    this.minConfidence = minConfidence;
    this.initMediaPipeHands();
  }

  public setConfidenceThreshold(threshold: number) {
    this.minConfidence = threshold;
  }

  private initMediaPipeHands() {
    if (typeof window === 'undefined') return;

    const win = window as any;
    if (win.Hands) {
      try {
        this.handsInstance = new win.Hands({
          locateFile: (file: string) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4/${file}`;
          }
        });

        this.handsInstance.setOptions({
          maxNumHands: 2,
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        this.handsInstance.onResults((results: any) => {
          this.handleHandsResults(results);
        });
      } catch (err) {
        console.warn('Could not initialize window.Hands:', err);
      }
    }
  }

  public async startCamera(): Promise<void> {
    if (!this.videoElement) throw new Error('Video element not available');

    // Request webcam permissions explicitly
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });

      this.videoElement.srcObject = this.mediaStream;
      await this.videoElement.play();

      this.isProcessing = true;
      this.startProcessingLoop();
    } catch (err: any) {
      let message = 'Unable to access webcam.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        message = 'Camera permission denied. Please allow camera access in your browser address bar.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        message = 'No webcam detected on this device.';
      } else if (err.name === 'NotReadableError') {
        message = 'Webcam is currently in use by another application.';
      }
      throw new Error(message);
    }
  }

  private startProcessingLoop() {
    let lastProcessTime = 0;
    const processFrame = async (timestamp: number) => {
      if (!this.isProcessing || !this.videoElement || !this.canvasElement) return;

      // Throttle to ~15 FPS to conserve CPU and smooth inference
      if (timestamp - lastProcessTime > 66) {
        lastProcessTime = timestamp;

        if (this.videoElement.readyState >= 2) {
          if (this.handsInstance) {
            try {
              await this.handsInstance.send({ image: this.videoElement });
            } catch (err) {
              // Fallback frame handling
              this.drawBlankCanvas();
            }
          } else {
            // MediaPipe not loaded from CDN, draw clean preview
            this.drawBlankCanvas();
          }
        }
      }

      this.animationFrameId = requestAnimationFrame(processFrame);
    };

    this.animationFrameId = requestAnimationFrame(processFrame);
  }

  private handleHandsResults(results: any) {
    if (!this.canvasElement || !this.videoElement) return;
    const ctx = this.canvasElement.getContext('2d');
    if (!ctx) return;

    const width = this.canvasElement.width = this.videoElement.videoWidth || 640;
    const height = this.canvasElement.height = this.videoElement.videoHeight || 480;

    ctx.clearRect(0, 0, width, height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const primaryLandmarks: HandLandmark[] = results.multiHandLandmarks[0];

      // Draw skeleton
      this.drawLandmarkSkeleton(ctx, primaryLandmarks, width, height, '#2563eb');

      // If second hand present, draw it too
      if (results.multiHandLandmarks.length > 1) {
        this.drawLandmarkSkeleton(ctx, results.multiHandLandmarks[1], width, height, '#0d9488');
      }

      // Run inference
      const prediction = predictSign(
        { landmarks: primaryLandmarks, handedness: 'Right' },
        this.minConfidence
      );

      this.onPredictionCallback?.(prediction, primaryLandmarks);
    } else {
      // No hand detected in frame
      const emptyPrediction: PredictionResult = {
        signId: 'none',
        signName: 'No Hand Detected',
        confidence: 0,
        isCertain: false,
        isSupported: false,
        rawDistribution: {},
        latencyMs: 1.0,
        timestamp: new Date().toISOString()
      };
      this.onPredictionCallback?.(emptyPrediction, []);
    }
  }

  private drawLandmarkSkeleton(
    ctx: CanvasRenderingContext2D,
    landmarks: HandLandmark[],
    width: number,
    height: number,
    color: string
  ) {
    ctx.save();
    // Mirror coordinates horizontally to match webcam mirrored preview
    ctx.scale(-1, 1);
    ctx.translate(-width, 0);

    // Draw bones / connections
    ctx.lineWidth = 3;
    ctx.strokeStyle = color;
    ctx.lineCap = 'round';

    for (const [startIdx, endIdx] of HAND_CONNECTIONS) {
      const start = landmarks[startIdx];
      const end = landmarks[endIdx];
      if (!start || !end) continue;

      ctx.beginPath();
      ctx.moveTo(start.x * width, start.y * height);
      ctx.lineTo(end.x * width, end.y * height);
      ctx.stroke();
    }

    // Draw landmark joints
    for (let i = 0; i < landmarks.length; i++) {
      const lm = landmarks[i];
      const x = lm.x * width;
      const y = lm.y * height;

      ctx.beginPath();
      ctx.arc(x, y, i === 0 || i === 4 || i === 8 || i === 12 || i === 16 || i === 20 ? 5 : 3.5, 0, 2 * Math.PI);
      ctx.fillStyle = i === 0 ? '#1e293b' : (i === 4 || i === 8 || i === 12 || i === 16 || i === 20 ? '#38bdf8' : '#ffffff');
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = color;
      ctx.stroke();
    }

    ctx.restore();
  }

  private drawBlankCanvas() {
    if (!this.canvasElement) return;
    const ctx = this.canvasElement.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
    }
  }

  public stopCamera() {
    this.isProcessing = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => {
        track.stop();
      });
      this.mediaStream = null;
    }

    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }

    this.drawBlankCanvas();
  }

  /**
   * Diagnostic Test Simulator:
   * Feeds verified hand landmark coordinates of any selected sign to test the pipeline
   * without needing a physical webcam.
   */
  public simulateSign(signId: string): PredictionResult {
    const protoMap: Record<string, { x: number; y: number; z: number }[]> = {
      namaste: [
        {x: 0.5, y: 0.8, z: 0},
        {x: 0.54, y: 0.74, z: 0}, {x: 0.56, y: 0.68, z: 0}, {x: 0.57, y: 0.62, z: 0}, {x: 0.57, y: 0.58, z: 0},
        {x: 0.52, y: 0.66, z: 0}, {x: 0.53, y: 0.58, z: 0}, {x: 0.53, y: 0.52, z: 0}, {x: 0.53, y: 0.46, z: 0},
        {x: 0.50, y: 0.64, z: 0}, {x: 0.50, y: 0.56, z: 0}, {x: 0.50, y: 0.50, z: 0}, {x: 0.50, y: 0.43, z: 0},
        {x: 0.48, y: 0.65, z: 0}, {x: 0.47, y: 0.57, z: 0}, {x: 0.47, y: 0.51, z: 0}, {x: 0.47, y: 0.45, z: 0},
        {x: 0.46, y: 0.66, z: 0}, {x: 0.45, y: 0.60, z: 0}, {x: 0.45, y: 0.54, z: 0}, {x: 0.45, y: 0.49, z: 0}
      ],
      thank_you: [
        {x: 0.5, y: 0.7, z: 0},
        {x: 0.56, y: 0.66, z: 0}, {x: 0.59, y: 0.62, z: 0}, {x: 0.60, y: 0.58, z: 0}, {x: 0.60, y: 0.55, z: 0},
        {x: 0.54, y: 0.56, z: 0}, {x: 0.55, y: 0.50, z: 0}, {x: 0.55, y: 0.44, z: 0}, {x: 0.55, y: 0.38, z: 0},
        {x: 0.51, y: 0.54, z: 0}, {x: 0.51, y: 0.46, z: 0}, {x: 0.51, y: 0.40, z: 0}, {x: 0.51, y: 0.34, z: 0},
        {x: 0.48, y: 0.55, z: 0}, {x: 0.48, y: 0.48, z: 0}, {x: 0.48, y: 0.42, z: 0}, {x: 0.48, y: 0.37, z: 0},
        {x: 0.45, y: 0.56, z: 0}, {x: 0.45, y: 0.50, z: 0}, {x: 0.45, y: 0.45, z: 0}, {x: 0.45, y: 0.40, z: 0}
      ],
      stop: [
        {x: 0.5, y: 0.75, z: 0},
        {x: 0.55, y: 0.71, z: 0}, {x: 0.58, y: 0.68, z: 0}, {x: 0.59, y: 0.65, z: 0}, {x: 0.59, y: 0.62, z: 0},
        {x: 0.52, y: 0.61, z: 0}, {x: 0.53, y: 0.54, z: 0}, {x: 0.53, y: 0.47, z: 0}, {x: 0.53, y: 0.41, z: 0},
        {x: 0.50, y: 0.59, z: 0}, {x: 0.50, y: 0.51, z: 0}, {x: 0.50, y: 0.44, z: 0}, {x: 0.50, y: 0.38, z: 0},
        {x: 0.48, y: 0.60, z: 0}, {x: 0.47, y: 0.53, z: 0}, {x: 0.47, y: 0.46, z: 0}, {x: 0.47, y: 0.40, z: 0},
        {x: 0.46, y: 0.61, z: 0}, {x: 0.45, y: 0.55, z: 0}, {x: 0.45, y: 0.49, z: 0}, {x: 0.45, y: 0.44, z: 0}
      ],
      good: [
        {x: 0.5, y: 0.65, z: 0},
        {x: 0.54, y: 0.61, z: 0}, {x: 0.56, y: 0.55, z: 0}, {x: 0.57, y: 0.48, z: 0}, {x: 0.57, y: 0.41, z: 0}, // thumb up
        {x: 0.53, y: 0.61, z: 0}, {x: 0.54, y: 0.65, z: 0}, {x: 0.52, y: 0.67, z: 0}, {x: 0.50, y: 0.65, z: 0}, // curled
        {x: 0.50, y: 0.60, z: 0}, {x: 0.50, y: 0.66, z: 0}, {x: 0.50, y: 0.68, z: 0}, {x: 0.50, y: 0.66, z: 0}, // curled
        {x: 0.48, y: 0.61, z: 0}, {x: 0.48, y: 0.65, z: 0}, {x: 0.48, y: 0.67, z: 0}, {x: 0.49, y: 0.65, z: 0}, // curled
        {x: 0.46, y: 0.62, z: 0}, {x: 0.46, y: 0.66, z: 0}, {x: 0.47, y: 0.68, z: 0}, {x: 0.48, y: 0.66, z: 0}  // curled
      ]
    };

    const lms = protoMap[signId] || protoMap['namaste'];
    const prediction = predictSign({ landmarks: lms }, this.minConfidence);

    if (this.canvasElement) {
      const ctx = this.canvasElement.getContext('2d');
      if (ctx) {
        this.canvasElement.width = 640;
        this.canvasElement.height = 480;
        this.drawLandmarkSkeleton(ctx, lms, 640, 480, '#2563eb');
      }
    }

    this.onPredictionCallback?.(prediction, lms);
    return prediction;
  }
}
