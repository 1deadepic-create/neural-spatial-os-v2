/**
 * Neural Spatial OS v2 — Camera Stream Manager
 * 
 * Handles webcam input via WebRTC.
 */

import EventBus from '@core/event-bus';
import { EVENTS, LogLevel } from '@core/constants';

export interface CameraStreamConfig {
  width?: number;
  height?: number;
  facingMode?: 'user' | 'environment';
}

export class CameraStream {
  private stream?: MediaStream;
  private video?: HTMLVideoElement;
  private canvas?: HTMLCanvasElement;
  private context?: CanvasRenderingContext2D;
  private isActive: boolean = false;
  private config: Required<CameraStreamConfig>;
  private eventBus: EventBus;

  constructor(config: CameraStreamConfig = {}) {
    this.config = {
      width: config.width ?? 1280,
      height: config.height ?? 720,
      facingMode: config.facingMode ?? 'user',
    };
    this.eventBus = EventBus.getInstance();
  }

  /**
   * Initialize camera stream
   */
  public async init(): Promise<void> {
    try {
      // Request camera access
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: this.config.width },
          height: { ideal: this.config.height },
          facingMode: this.config.facingMode,
        },
        audio: false,
      });

      // Create video element
      this.video = document.createElement('video');
      this.video.srcObject = this.stream;
      this.video.play();
      this.video.width = this.config.width;
      this.video.height = this.config.height;

      // Create canvas for frame capture
      this.canvas = document.createElement('canvas');
      this.canvas.width = this.config.width;
      this.canvas.height = this.config.height;
      this.context = this.canvas.getContext('2d')!;

      this.isActive = true;
      this.eventBus.emit(EVENTS['input:camera:ready']);
    } catch (error) {
      console.error('Camera initialization failed:', error);
      this.eventBus.emit(EVENTS['input:camera:error'], { error });
      throw error;
    }
  }

  /**
   * Capture current frame as ImageData
   */
  public captureFrame(): ImageData | null {
    if (!this.video || !this.context || !this.isActive) {
      return null;
    }

    this.context.drawImage(this.video, 0, 0, this.config.width, this.config.height);
    return this.context.getImageData(0, 0, this.config.width, this.config.height);
  }

  /**
   * Get current video frame as canvas element
   */
  public getFrameCanvas(): HTMLCanvasElement | null {
    if (!this.canvas || !this.isActive) {
      return null;
    }
    return this.canvas;
  }

  /**
   * Get video element (for debugging/display)
   */
  public getVideoElement(): HTMLVideoElement | null {
    return this.video || null;
  }

  /**
   * Stop camera stream
   */
  public stop(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = undefined;
    }
    this.isActive = false;
  }

  /**
   * Check if stream is active
   */
  public isRunning(): boolean {
    return this.isActive;
  }

  /**
   * Get stream dimensions
   */
  public getDimensions(): { width: number; height: number } {
    return { width: this.config.width, height: this.config.height };
  }
}
