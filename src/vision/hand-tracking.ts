/**
 * Neural Spatial OS v2 — Hand Tracking System
 * 
 * Uses MediaPipe Hands for real-time hand tracking.
 */

import * as tf from '@tensorflow/tfjs';
import * as handPoseDetection from '@tensorflow-models/hand-pose-detection';
import { HandFrame } from '@vision/gesture-types';
import EventBus from '@core/event-bus';
import { EVENTS, HAND_CONFIDENCE_THRESHOLD } from '@core/constants';

export interface HandTrackingConfig {
  modelType?: 'mediapipe' | 'coco';
  maxHands?: number;
  flipHorizontal?: boolean;
}

export class HandTrackingEngine {
  private detector?: handPoseDetection.HandPoseDetector;
  private isInitialized: boolean = false;
  private config: Required<HandTrackingConfig>;
  private eventBus: EventBus;
  private lastFrames: Map<string, HandFrame> = new Map();

  constructor(config: HandTrackingConfig = {}) {
    this.config = {
      modelType: config.modelType ?? 'mediapipe',
      maxHands: config.maxHands ?? 2,
      flipHorizontal: config.flipHorizontal ?? true,
    };
    this.eventBus = EventBus.getInstance();
  }

  /**
   * Initialize hand tracking model
   */
  public async init(): Promise<void> {
    try {
      // Load hand pose detection model
      const estimationConfig: handPoseDetection.MediaPipeHandsMediaPipeConfig = {
        runtime: 'mediapipe',
        solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands',
        maxHands: this.config.maxHands,
      };

      this.detector = await handPoseDetection.createDetector(
        handPoseDetection.SupportedModels.MediaPipeHands,
        estimationConfig
      );

      this.isInitialized = true;
      console.log('Hand tracking model initialized');
    } catch (error) {
      console.error('Hand tracking initialization failed:', error);
      throw error;
    }
  }

  /**
   * Process frame and detect hands
   */
  public async processFrame(
    input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
  ): Promise<HandFrame[]> {
    if (!this.isInitialized || !this.detector) {
      return [];
    }

    try {
      const hands = await this.detector.estimateHands(input, {
        flipHorizontal: this.config.flipHorizontal,
      });

      const frames: HandFrame[] = [];

      for (const hand of hands) {
        const confidence = hand.score ?? 0;

        if (confidence < HAND_CONFIDENCE_THRESHOLD) {
          continue;
        }

        const handId = `${hand.handedness}-${Date.now()}`;
        const keypoints = hand.keypoints || [];

        const frame: HandFrame = {
          handId,
          handedness: hand.handedness as 'Left' | 'Right',
          landmarks: keypoints.map((kp) => ({
            x: kp.x,
            y: kp.y,
            z: kp.z ?? 0,
          })),
          confidence,
          timestamp: Date.now(),
          worldLandmarks: hand.keypoints3D
            ? hand.keypoints3D.map((kp) => ({
                x: kp.x,
                y: kp.y,
                z: kp.z,
              }))
            : undefined,
        };

        frames.push(frame);
        this.lastFrames.set(handId, frame);
        this.eventBus.emit(EVENTS['hand:frame'], frame);
      }

      return frames;
    } catch (error) {
      console.error('Hand detection error:', error);
      return [];
    }
  }

  /**
   * Get last detected hand frames
   */
  public getLastFrames(): HandFrame[] {
    return Array.from(this.lastFrames.values());
  }

  /**
   * Clear cached frames
   */
  public clearCache(): void {
    this.lastFrames.clear();
  }

  /**
   * Check if initialized
   */
  public isReady(): boolean {
    return this.isInitialized;
  }
}
