/**
 * Neural Spatial OS v2 — Core Event Bus
 * 
 * Central pub/sub system for event-driven architecture.
 * Zero coupling between modules—all communication through events.
 */

import { EventEmitter } from 'event-emitter';
import { EVENTS, LogLevel, EVENT_BUS_MAX_LISTENERS } from './constants';

type EventName = string;
type EventCallback = (payload: any) => void;
type EventHandler = {
  callback: EventCallback;
  once?: boolean;
  context?: any;
};

export interface EventBusConfig {
  maxListeners?: number;
  logLevel?: LogLevel;
}

/**
 * Core event bus system.
 * 
 * Usage:
 * ```ts
 * const bus = EventBus.getInstance();
 * 
 * // Subscribe
 * bus.subscribe('gesture:pinch_start', (payload) => {
 *   console.log('Pinch started!', payload);
 * });
 * 
 * // Emit
 * bus.emit('gesture:pinch_start', { handId: 'right', confidence: 0.95 });
 * 
 * // Unsubscribe
 * bus.unsubscribe('gesture:pinch_start', callback);
 * ```
 */
export class EventBus {
  private static instance: EventBus;
  private emitter: any; // event-emitter instance
  private handlers: Map<EventName, EventHandler[]> = new Map();
  private config: Required<EventBusConfig>;
  private eventLog: Array<{ name: string; timestamp: number; payload: any }> = [];
  private logEnabled: boolean = false;

  private constructor(config: EventBusConfig = {}) {
    this.config = {
      maxListeners: config.maxListeners ?? EVENT_BUS_MAX_LISTENERS,
      logLevel: config.logLevel ?? LogLevel.INFO,
    };

    this.emitter = new EventEmitter();
    this.emitter.setMaxListeners(this.config.maxListeners);
    this.logEnabled = this.config.logLevel === LogLevel.DEBUG;
  }

  /**
   * Get singleton instance of EventBus
   */
  public static getInstance(config?: EventBusConfig): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus(config);
    }
    return EventBus.instance;
  }

  /**
   * Subscribe to an event
   * 
   * @param eventName - Event name to listen for
   * @param callback - Function to call when event is emitted
   * @param context - Optional context to bind to callback
   * @returns Unsubscribe function
   */
  public subscribe(
    eventName: EventName,
    callback: EventCallback,
    context?: any
  ): () => void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }

    const handler: EventHandler = { callback, context };
    this.handlers.get(eventName)!.push(handler);

    // Register with emitter
    if (context) {
      this.emitter.on(eventName, callback.bind(context));
    } else {
      this.emitter.on(eventName, callback);
    }

    // Return unsubscribe function
    return () => this.unsubscribe(eventName, callback);
  }

  /**
   * Subscribe to an event, fire only once
   * 
   * @param eventName - Event name to listen for
   * @param callback - Function to call when event is emitted
   * @param context - Optional context to bind to callback
   */
  public once(
    eventName: EventName,
    callback: EventCallback,
    context?: any
  ): () => void {
    const wrappedCallback = (payload: any) => {
      callback.call(context, payload);
      this.unsubscribe(eventName, wrappedCallback);
    };

    return this.subscribe(eventName, wrappedCallback, context);
  }

  /**
   * Unsubscribe from an event
   * 
   * @param eventName - Event name
   * @param callback - Callback to remove (if not provided, removes all listeners)
   */
  public unsubscribe(eventName: EventName, callback?: EventCallback): void {
    if (!callback) {
      this.emitter.removeAllListeners(eventName);
      this.handlers.delete(eventName);
      return;
    }

    this.emitter.off(eventName, callback);

    const handlers = this.handlers.get(eventName);
    if (handlers) {
      const index = handlers.findIndex((h) => h.callback === callback);
      if (index > -1) {
        handlers.splice(index, 1);
      }
      if (handlers.length === 0) {
        this.handlers.delete(eventName);
      }
    }
  }

  /**
   * Emit an event with optional payload
   * 
   * @param eventName - Event name
   * @param payload - Data to pass to listeners
   */
  public emit(eventName: EventName, payload?: any): void {
    if (this.logEnabled) {
      this.eventLog.push({
        name: eventName,
        timestamp: Date.now(),
        payload,
      });

      // Keep log size reasonable
      if (this.eventLog.length > 10000) {
        this.eventLog.shift();
      }
    }

    this.emitter.emit(eventName, payload);
  }

  /**
   * Emit event and wait for response (for request-response patterns)
   * Useful for queries like "get current mode"
   * 
   * @param eventName - Event name
   * @param payload - Request data
   * @param timeout - Max time to wait for response (ms)
   * @returns Promise resolving to response
   */
  public async query(
    eventName: EventName,
    payload?: any,
    timeout: number = 5000
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Query timeout for event: ${eventName}`));
      }, timeout);

      const responseEvent = `${eventName}:response`;
      const cleanup = this.once(responseEvent, (response) => {
        clearTimeout(timer);
        resolve(response);
      });

      this.emit(eventName, { ...payload, __queryId: Date.now() });
    });
  }

  /**
   * Get current listener count for an event
   */
  public listenerCount(eventName: EventName): number {
    const handlers = this.handlers.get(eventName);
    return handlers ? handlers.length : 0;
  }

  /**
   * Get all registered event names
   */
  public eventNames(): EventName[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * Get event emission log (debug only)
   */
  public getEventLog(): Array<{ name: string; timestamp: number; payload: any }> {
    return [...this.eventLog];
  }

  /**
   * Clear event log
   */
  public clearEventLog(): void {
    this.eventLog = [];
  }

  /**
   * Reset entire event bus (clears all subscriptions and logs)
   * WARNING: Only use in tests or during shutdown
   */
  public reset(): void {
    this.emitter.removeAllListeners();
    this.handlers.clear();
    this.eventLog = [];
  }

  /**
   * Enable/disable event logging for debugging
   */
  public setLogging(enabled: boolean): void {
    this.logEnabled = enabled;
  }

  /**
   * Get all listeners for an event
   */
  public getListeners(eventName: EventName): EventCallback[] {
    const handlers = this.handlers.get(eventName);
    return handlers ? handlers.map((h) => h.callback) : [];
  }
}

/**
 * Utility decorator for easy event subscription in classes
 * 
 * Usage:
 * ```ts
 * class MyModule {
 *   @OnEvent('gesture:pinch_start')
 *   handlePinch(payload) {
 *     console.log('Pinch!', payload);
 *   }
 * }
 * ```
 */
export function OnEvent(eventName: EventName) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    const bus = EventBus.getInstance();
    bus.subscribe(eventName, originalMethod);

    return descriptor;
  };
}

// Export singleton
export default EventBus.getInstance();
