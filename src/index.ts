/**
 * Neural Spatial OS v2 — Main Entry Point
 */

export * from '@core/event-bus';
export * from '@core/spatial-object';
export * from '@core/constants';

export * from '@input/camera-stream';
export * from '@vision/hand-tracking';
export * from '@vision/gesture-engine';
export * from '@vision/gesture-types';

export * from '@spatial/spatial-world';

// Version
export const VERSION = '0.1.0';

console.log(`Neural Spatial OS v2 (v${VERSION}) loaded`);
