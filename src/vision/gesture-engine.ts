/**
 * Neural Spatial OS v2 — Gesture Recognition Engine
 * 
 * Recognizes gestures from hand frames using threshold-based detection.
 */

import { HandFrame, GestureType, GestureRecognitionResult, GesturePayload, PinchGesturePayload } from '@vision/gesture-types';
import EventBus from '@core/event-bus';
import { EVENTS, GESTURE_PINCH_DISTANCE_THRESHOLD, GESTURE_GRAB_FINGER_CURL_THRESHOLD } from '@core/constants';

interface GestureState {
  current: GestureType | null;
  frameCount: number;
  startTime: number;
}

export class GestureEngine {
  private gestureStates: Map<string, GestureState> = new Map();
  private eventBus: EventBus;
  private lastFrames: HandFrame[] = [];

  constructor() {
    this.eventBus = EventBus.getInstance();
  }

  /**
   * Process hand frame and recognize gestures
   */
  public processFrame(frame: HandFrame): GestureRecognitionResult[] {
    this.lastFrames = [frame];
    const results: GestureRecognitionResult[] = [];

    // Check pinch gesture
    const pinchGesture = this.detectPinch(frame);
    if (pinchGesture) {
      results.push(pinchGesture);
    }

    // Check grab gesture
    const grabGesture = this.detectGrab(frame);
    if (grabGesture) {
      results.push(grabGesture);
    }

    // Check palm orientation
    const palmGesture = this.detectPalmOrientation(frame);
    if (palmGesture) {
      results.push(palmGesture);
    }

    // Emit gesture events
    results.forEach((result) => {
      const eventName = `gesture:${result.gesture}`;
      this.eventBus.emit(eventName, result.payload);
    });

    return results;
  }

  /**
   * Detect pinch gesture (thumb + index finger)
   */
  private detectPinch(frame: HandFrame): GestureRecognitionResult | null {
    const landmarks = frame.landmarks;
    if (landmarks.length < 17) return null;

    // Thumb tip (4) and index tip (8)
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];

    const distance = Math.sqrt(
      Math.pow(thumbTip.x - indexTip.x, 2) +
        Math.pow(thumbTip.y - indexTip.y, 2) +
        Math.pow(thumbTip.z - indexTip.z, 2)
    );

    if (distance < GESTURE_PINCH_DISTANCE_THRESHOLD) {
      const center = {
        x: (thumbTip.x + indexTip.x) / 2,
        y: (thumbTip.y + indexTip.y) / 2,
        z: (thumbTip.z + indexTip.z) / 2,
      };

      const payload: PinchGesturePayload = {
        timestamp: frame.timestamp,
        handId: frame.handId,
        handedness: frame.handedness,
        confidence: frame.confidence,
        position: center,
        distance,
        center,
      };

      return {
        gesture: GestureType.PINCH_START,
        confidence: frame.confidence,
        payload,
        frame,
      };
    }

    return null;
  }

  /**
   * Detect grab gesture (all fingers closed)
   */
  private detectGrab(frame: HandFrame): GestureRecognitionResult | null {
    const landmarks = frame.landmarks;
    if (landmarks.length < 21) return null;

    // Calculate finger curl (distance from base to tip)
    const fingerTips = [8, 12, 16, 20]; // index, middle, ring, pinky
    const fingerBases = [5, 9, 13, 17];

    let totalCurl = 0;
    for (let i = 0; i < fingerTips.length; i++) {
      const tip = landmarks[fingerTips[i]];
      const base = landmarks[fingerBases[i]];
      const distance = Math.sqrt(
        Math.pow(tip.x - base.x, 2) + Math.pow(tip.y - base.y, 2) + Math.pow(tip.z - base.z, 2)
      );
      totalCurl += distance;
    }

    const averageCurl = totalCurl / fingerTips.length;

    if (averageCurl < GESTURE_GRAB_FINGER_CURL_THRESHOLD) {
      const payload: GesturePayload = {
        timestamp: frame.timestamp,
        handId: frame.handId,
        handedness: frame.handedness,
        confidence: frame.confidence,
        position: {
          x: landmarks[9].x,
          y: landmarks[9].y,
          z: landmarks[9].z,
        },
      };

      return {
        gesture: GestureType.GRAB_START,
        confidence: frame.confidence,
        payload,
        frame,
      };
    }

    return null;
  }

  /**
   * Detect palm orientation (up/down)
   */
  private detectPalmOrientation(frame: HandFrame): GestureRecognitionResult | null {
    const landmarks = frame.landmarks;
    if (landmarks.length < 10) return null;

    // Palm normal vector (using wrist, middle finger base, and index finger base)
    const wrist = landmarks[0];
    const middle = landmarks[9];
    const index = landmarks[5];

    // Vector from wrist to middle
    const v1 = { x: middle.x - wrist.x, y: middle.y - wrist.y, z: middle.z - wrist.z };
    // Vector from wrist to index
    const v2 = { x: index.x - wrist.x, y: index.y - wrist.y, z: index.z - wrist.z };

    // Cross product for normal
    const normal = {
      x: v1.y * v2.z - v1.z * v2.y,
      y: v1.z * v2.x - v1.x * v2.z,
      z: v1.x * v2.y - v1.y * v2.x,
    };

    // If Y component of normal is positive, palm is up
    const gesture = normal.y > 0 ? GestureType.PALM_UP : GestureType.PALM_DOWN;

    const payload: GesturePayload = {
      timestamp: frame.timestamp,
      handId: frame.handId,
      handedness: frame.handedness,
      confidence: frame.confidence,
      position: wrist,
    };

    return {
      gesture,
      confidence: frame.confidence,
      payload,
      frame,
    };
  }
}
