/**
 * Neural Spatial OS v2 — Core Constants
 */

// System version
export const SYSTEM_VERSION = '0.1.0';
export const SYSTEM_NAME = 'Neural Spatial OS v2';

// Performance targets
export const TARGET_FPS = 60;
export const FRAME_TIME_MS = 1000 / TARGET_FPS; // ~16.67ms

// Hand tracking
export const HAND_LANDMARKS_COUNT = 21;
export const HAND_CONFIDENCE_THRESHOLD = 0.5;
export const HAND_TRACKING_UPDATE_INTERVAL_MS = 16; // ~60fps

// Gesture recognition thresholds
export const GESTURE_PINCH_DISTANCE_THRESHOLD = 0.05; // meters
export const GESTURE_PINCH_CONFIDENCE_THRESHOLD = 0.7;
export const GESTURE_GRAB_FINGER_CURL_THRESHOLD = 0.8;
export const GESTURE_SWIPE_VELOCITY_THRESHOLD = 0.5; // meters/second
export const GESTURE_SWIPE_MIN_DISTANCE = 0.1; // meters

// Spatial world
export const SPATIAL_WORLD_WIDTH = 100;
export const SPATIAL_WORLD_HEIGHT = 100;
export const SPATIAL_WORLD_DEPTH = 100;

// Camera
export const DEFAULT_CAMERA_FOV = 75;
export const DEFAULT_CAMERA_NEAR = 0.1;
export const DEFAULT_CAMERA_FAR = 1000;

// Physics
export const PHYSICS_GRAVITY = -9.81;
export const PHYSICS_TIME_STEP = 1 / 60; // 60Hz physics

// UI
export const DEFAULT_PANEL_WIDTH = 512;
export const DEFAULT_PANEL_HEIGHT = 768;
export const DEFAULT_PANEL_Z_DISTANCE = 2;
export const UI_LAYER_Z = 10;

// Modes
export enum SystemMode {
  BUSINESS = 'business',
  EDUCATION = 'education',
  DAW = 'daw',
  CREATIVE = 'creative',
}

// Plugin system
export const PLUGIN_SANDBOX_TIMEOUT_MS = 5000;
export const PLUGIN_MAX_CONCURRENT = 10;
export const PLUGIN_LIFECYCLE_EVENTS = ['load', 'init', 'active', 'suspend', 'unload'];

// Event bus
export const EVENT_BUS_MAX_LISTENERS = 100;
export const EVENT_BUS_WARN_THRESHOLD = 10;

// Security
export const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
export const GESTURE_PROFILE_MIN_SAMPLES = 50;

// AI
export const AI_QUERY_TIMEOUT_MS = 10000;
export const AI_MAX_CONTEXT_LENGTH = 4096;

// Logging
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

// Event names (non-exhaustive list)
export const EVENTS = {
  // System lifecycle
  'system:init': 'system:init',
  'system:ready': 'system:ready',
  'system:shutdown': 'system:shutdown',
  
  // Input events
  'input:camera:ready': 'input:camera:ready',
  'input:camera:error': 'input:camera:error',
  'input:audio:ready': 'input:audio:ready',
  
  // Hand tracking
  'hand:detected': 'hand:detected',
  'hand:lost': 'hand:lost',
  'hand:frame': 'hand:frame',
  
  // Gesture events
  'gesture:pinch_start': 'gesture:pinch_start',
  'gesture:pinch_hold': 'gesture:pinch_hold',
  'gesture:pinch_end': 'gesture:pinch_end',
  'gesture:grab_start': 'gesture:grab_start',
  'gesture:grab_end': 'gesture:grab_end',
  'gesture:swipe': 'gesture:swipe',
  'gesture:rotate': 'gesture:rotate',
  
  // Spatial world
  'spatial:object:spawn': 'spatial:object:spawn',
  'spatial:object:remove': 'spatial:object:remove',
  'spatial:object:transform': 'spatial:object:transform',
  'spatial:object:attach': 'spatial:object:attach',
  'spatial:object:detach': 'spatial:object:detach',
  
  // UI
  'ui:panel:open': 'ui:panel:open',
  'ui:panel:close': 'ui:panel:close',
  'ui:panel:focus': 'ui:panel:focus',
  
  // Modes
  'mode:change': 'mode:change',
  'mode:active': 'mode:active',
  
  // Plugins
  'plugin:load': 'plugin:load',
  'plugin:init': 'plugin:init',
  'plugin:active': 'plugin:active',
  'plugin:suspend': 'plugin:suspend',
  'plugin:unload': 'plugin:unload',
  'plugin:error': 'plugin:error',
  
  // AI
  'ai:query': 'ai:query',
  'ai:response': 'ai:response',
  'ai:error': 'ai:error',
  
  // Connectors
  'connector:auth': 'connector:auth',
  'connector:fetch': 'connector:fetch',
  'connector:push': 'connector:push',
  
  // Render
  'render:frame': 'render:frame',
  'render:error': 'render:error',
} as const;
