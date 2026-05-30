/**
 * Neural Spatial OS v2 — Gesture Type Definitions
 */

export interface Vector2 {
  x: number;
  y: number;
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Landmark {
  x: number;
  y: number;
  z: number;
}

/**
 * Hand frame from MediaPipe or tracking system
 */
export interface HandFrame {
  handId: string;
  handedness: 'Left' | 'Right';
  landmarks: Landmark[]; // 21 hand landmarks
  confidence: number; // 0-1
  timestamp: number;
  worldLandmarks?: Landmark[]; // Optional world space coordinates
}

/**
 * Gesture event payload
 */
export interface GesturePayload {
  timestamp: number;
  handId: string;
  handedness: 'Left' | 'Right';
  confidence: number;
  position?: Vector3; // Position of gesture origin
  direction?: Vector3; // Direction for swipes/rotations
  magnitude?: number; // Distance/angle for scaled gestures
  metadata?: Record<string, any>;
}

/**
 * Pinch gesture (thumb + index finger)
 */
export interface PinchGesturePayload extends GesturePayload {
  distance: number; // Distance between thumb and index tip
  center: Vector3; // Center point between thumb and index
}

/**
 * Grab gesture (all fingers closed)
 */
export interface GrabGesturePayload extends GesturePayload {
  grabStrength: number; // 0-1 how strongly hand is closed
}

/**
 * Swipe gesture (quick hand movement)
 */
export interface SwipeGesturePayload extends GesturePayload {
  direction: 'up' | 'down' | 'left' | 'right' | 'forward' | 'backward';
  velocity: number; // Pixels or units per frame
  distance: number; // Total distance traveled
  duration: number; // Time taken in ms
}

/**
 * Rotation gesture (wrist rotation)
 */
export interface RotationGesturePayload extends GesturePayload {
  axis: 'x' | 'y' | 'z';
  angle: number; // Rotation angle in radians
  angularVelocity: number; // Radians per second
}

/**
 * Two-hand gesture (both hands)
 */
export interface TwoHandGesturePayload {
  timestamp: number;
  leftHand: HandFrame;
  rightHand: HandFrame;
  distance: number; // Distance between hands
  centerPoint: Vector3; // Midpoint between hands
  relativeRotation?: number;
}

/**
 * Gesture recognition result
 */
export interface GestureRecognitionResult {
  gesture: GestureType;
  confidence: number;
  payload: GesturePayload;
  frame: HandFrame;
}

/**
 * Gesture types
 */
export enum GestureType {
  // Single hand
  PINCH_START = 'pinch_start',
  PINCH_HOLD = 'pinch_hold',
  PINCH_END = 'pinch_end',
  
  GRAB_START = 'grab_start',
  GRAB_HOLD = 'grab_hold',
  GRAB_END = 'grab_end',
  
  SWIPE_UP = 'swipe_up',
  SWIPE_DOWN = 'swipe_down',
  SWIPE_LEFT = 'swipe_left',
  SWIPE_RIGHT = 'swipe_right',
  SWIPE_FORWARD = 'swipe_forward',
  SWIPE_BACKWARD = 'swipe_backward',
  
  ROTATE_X = 'rotate_x',
  ROTATE_Y = 'rotate_y',
  ROTATE_Z = 'rotate_z',
  
  PALM_UP = 'palm_up',
  PALM_DOWN = 'palm_down',
  
  THUMBS_UP = 'thumbs_up',
  PEACE = 'peace',
  POINTING = 'pointing',
  
  // Two hand
  TWO_HAND_PINCH_START = 'two_hand_pinch_start',
  TWO_HAND_PINCH_HOLD = 'two_hand_pinch_hold',
  TWO_HAND_PINCH_END = 'two_hand_pinch_end',
  TWO_HAND_SPREAD = 'two_hand_spread',
}

/**
 * Gesture state machine for stateful gesture tracking
 */
export interface GestureState {
  current: GestureType | null;
  previous: GestureType | null;
  frameCount: number; // How many frames in current state
  startTime: number;
  endTime?: number;
  confidence: number;
}

/**
 * Gesture history for temporal analysis
 */
export interface GestureHistory {
  gestures: GestureRecognitionResult[];
  maxHistory: number;
  
  addGesture(result: GestureRecognitionResult): void;
  getRecent(count: number): GestureRecognitionResult[];
  getLastGesture(): GestureRecognitionResult | undefined;
  getTimeInLastGesture(): number;
  clear(): void;
}
