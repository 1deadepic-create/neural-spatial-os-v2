/**
 * Neural Spatial OS v2 — Spatial Object Model
 * 
 * Core data structure for all objects in the 3D spatial world.
 */

import { v4 as uuidv4 } from 'uuid';

export type SpatialObjectType = 'panel' | 'model' | 'effect' | 'control' | 'particle' | 'light';

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}

export interface Transform {
  position: Vector3;
  rotation: Vector3 | Quaternion;
  scale: Vector3;
}

export interface Physics {
  mass: number;
  velocity: Vector3;
  angularVelocity: Vector3;
  gravity: number;
  friction: number;
  restitution: number;
  isKinematic: boolean;
}

export interface RenderConfig {
  geometry: string;
  material: string;
  color?: string;
  opacity?: number;
  metalness?: number;
  roughness?: number;
  emissive?: string;
  map?: string;
}

export interface SpatialObjectMetadata {
  [key: string]: any;
}

/**
 * Core spatial object in 3D world
 */
export class SpatialObject {
  // Identity
  public id: string;
  public name: string;
  public type: SpatialObjectType;
  public tags: Set<string> = new Set();

  // Transform
  public position: Vector3 = { x: 0, y: 0, z: 0 };
  public rotation: Vector3 = { x: 0, y: 0, z: 0 };
  public scale: Vector3 = { x: 1, y: 1, z: 1 };

  // Dynamics
  public velocity: Vector3 = { x: 0, y: 0, z: 0 };
  public angularVelocity: Vector3 = { x: 0, y: 0, z: 0 };

  // Physics
  public physics?: Physics;

  // Rendering
  public renderConfig?: RenderConfig;

  // Parent-child hierarchy
  public parent?: SpatialObject;
  public children: Set<SpatialObject> = new Set();

  // Attachment (hand, object, etc.)
  public attachedTo?: string; // handId or other object id
  public attachmentOffset?: Vector3;

  // Interactivity
  public interactive: boolean = true;
  public raycastable: boolean = true;

  // Lifecycle
  public createdAt: number;
  public updatedAt: number;
  public active: boolean = true;

  // Custom metadata
  public metadata: SpatialObjectMetadata = {};

  constructor(
    type: SpatialObjectType,
    name?: string,
    position?: Vector3,
    renderConfig?: RenderConfig
  ) {
    this.id = uuidv4();
    this.type = type;
    this.name = name || `${type}-${this.id.substring(0, 8)}`;
    this.createdAt = Date.now();
    this.updatedAt = Date.now();

    if (position) {
      this.position = { ...position };
    }

    if (renderConfig) {
      this.renderConfig = { ...renderConfig };
    }
  }

  /**
   * Set position
   */
  public setPosition(x: number, y: number, z: number): void {
    this.position = { x, y, z };
    this.updatedAt = Date.now();
  }

  /**
   * Set rotation (euler angles in radians)
   */
  public setRotation(x: number, y: number, z: number): void {
    this.rotation = { x, y, z };
    this.updatedAt = Date.now();
  }

  /**
   * Set scale
   */
  public setScale(x: number, y: number, z: number): void {
    this.scale = { x, y, z };
    this.updatedAt = Date.now();
  }

  /**
   * Set velocity
   */
  public setVelocity(x: number, y: number, z: number): void {
    this.velocity = { x, y, z };
  }

  /**
   * Translate position relative to current
   */
  public translate(dx: number, dy: number, dz: number): void {
    this.position.x += dx;
    this.position.y += dy;
    this.position.z += dz;
    this.updatedAt = Date.now();
  }

  /**
   * Rotate relative to current rotation
   */
  public rotate(dx: number, dy: number, dz: number): void {
    this.rotation.x += dx;
    this.rotation.y += dy;
    this.rotation.z += dz;
    this.updatedAt = Date.now();
  }

  /**
   * Add child object
   */
  public addChild(child: SpatialObject): void {
    this.children.add(child);
    child.parent = this;
  }

  /**
   * Remove child object
   */
  public removeChild(child: SpatialObject): void {
    this.children.delete(child);
    child.parent = undefined;
  }

  /**
   * Get all descendants
   */
  public getDescendants(): SpatialObject[] {
    const descendants: SpatialObject[] = [];
    const queue = Array.from(this.children);

    while (queue.length > 0) {
      const current = queue.shift()!;
      descendants.push(current);
      queue.push(...current.children);
    }

    return descendants;
  }

  /**
   * Get world position (accounting for parent transforms)
   */
  public getWorldPosition(): Vector3 {
    if (!this.parent) {
      return { ...this.position };
    }

    const parentWorld = this.parent.getWorldPosition();
    return {
      x: parentWorld.x + this.position.x,
      y: parentWorld.y + this.position.y,
      z: parentWorld.z + this.position.z,
    };
  }

  /**
   * Attach to hand or another object
   */
  public attachTo(target: string, offset?: Vector3): void {
    this.attachedTo = target;
    this.attachmentOffset = offset || { x: 0, y: 0, z: 0 };
  }

  /**
   * Detach from target
   */
  public detach(): void {
    this.attachedTo = undefined;
    this.attachmentOffset = undefined;
  }

  /**
   * Add tag for grouping/filtering
   */
  public addTag(tag: string): void {
    this.tags.add(tag);
  }

  /**
   * Remove tag
   */
  public removeTag(tag: string): void {
    this.tags.delete(tag);
  }

  /**
   * Check if has tag
   */
  public hasTag(tag: string): boolean {
    return this.tags.has(tag);
  }

  /**
   * Enable physics for this object
   */
  public enablePhysics(config: Partial<Physics> = {}): void {
    this.physics = {
      mass: config.mass ?? 1,
      velocity: config.velocity ?? { x: 0, y: 0, z: 0 },
      angularVelocity: config.angularVelocity ?? { x: 0, y: 0, z: 0 },
      gravity: config.gravity ?? 9.81,
      friction: config.friction ?? 0.1,
      restitution: config.restitution ?? 0.3,
      isKinematic: config.isKinematic ?? false,
    };
  }

  /**
   * Disable physics
   */
  public disablePhysics(): void {
    this.physics = undefined;
  }

  /**
   * Serialize to JSON
   */
  public toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      tags: Array.from(this.tags),
      position: this.position,
      rotation: this.rotation,
      scale: this.scale,
      velocity: this.velocity,
      angularVelocity: this.angularVelocity,
      physics: this.physics,
      renderConfig: this.renderConfig,
      attachedTo: this.attachedTo,
      attachmentOffset: this.attachmentOffset,
      interactive: this.interactive,
      raycastable: this.raycastable,
      active: this.active,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      metadata: this.metadata,
    };
  }

  /**
   * Create from JSON
   */
  public static fromJSON(json: any): SpatialObject {
    const obj = new SpatialObject(json.type, json.name);
    obj.id = json.id;
    obj.position = json.position;
    obj.rotation = json.rotation;
    obj.scale = json.scale;
    obj.velocity = json.velocity;
    obj.angularVelocity = json.angularVelocity;
    obj.physics = json.physics;
    obj.renderConfig = json.renderConfig;
    obj.attachedTo = json.attachedTo;
    obj.attachmentOffset = json.attachmentOffset;
    obj.interactive = json.interactive;
    obj.raycastable = json.raycastable;
    obj.active = json.active;
    obj.createdAt = json.createdAt;
    obj.updatedAt = json.updatedAt;
    obj.metadata = json.metadata;
    json.tags.forEach((tag: string) => obj.addTag(tag));
    return obj;
  }
}
