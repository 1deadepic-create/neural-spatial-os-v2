/**
 * Neural Spatial OS v2 — Spatial World Engine
 * 
 * Manages 3D spatial world using Three.js
 */

import * as THREE from 'three';
import { SpatialObject } from '@core/spatial-object';
import EventBus from '@core/event-bus';
import { EVENTS } from '@core/constants';

export interface SpatialWorldConfig {
  canvas?: HTMLCanvasElement;
  width?: number;
  height?: number;
  backgroundColor?: number;
  enablePhysics?: boolean;
}

export class SpatialWorld {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private objects: Map<string, { spatial: SpatialObject; mesh: THREE.Object3D }> = new Map();
  private lights: THREE.Light[] = [];
  private eventBus: EventBus;
  private config: Required<SpatialWorldConfig>;
  private animationFrameId?: number;

  constructor(config: SpatialWorldConfig = {}) {
    this.config = {
      canvas: config.canvas,
      width: config.width ?? window.innerWidth,
      height: config.height ?? window.innerHeight,
      backgroundColor: config.backgroundColor ?? 0x1a1a2e,
      enablePhysics: config.enablePhysics ?? false,
    };

    this.eventBus = EventBus.getInstance();

    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.config.backgroundColor);

    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.config.width / this.config.height,
      0.1,
      1000
    );
    this.camera.position.z = 5;

    // Create renderer
    const rendererConfig: THREE.WebGLRendererParameters = {
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    };

    if (this.config.canvas) {
      rendererConfig.canvas = this.config.canvas;
    }

    this.renderer = new THREE.WebGLRenderer(rendererConfig);
    this.renderer.setSize(this.config.width, this.config.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    if (!this.config.canvas) {
      document.body.appendChild(this.renderer.domElement);
    }

    this.setupLights();
    this.setupEventListeners();
  }

  /**
   * Initialize world
   */
  public init(): void {
    this.eventBus.emit(EVENTS['system:init']);
  }

  /**
   * Setup default lighting
   */
  private setupLights(): void {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);
    this.lights.push(ambientLight);

    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    this.scene.add(directionalLight);
    this.lights.push(directionalLight);
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    window.addEventListener('resize', () => this.onWindowResize());
  }

  /**
   * Spawn spatial object in world
   */
  public spawnObject(spatialObject: SpatialObject): THREE.Object3D {
    // Create THREE.js mesh based on type
    let mesh: THREE.Object3D;

    switch (spatialObject.type) {
      case 'panel':
        mesh = new THREE.Mesh(
          new THREE.PlaneGeometry(2, 3),
          new THREE.MeshStandardMaterial({ color: 0x2d2d44 })
        );
        break;
      case 'model':
        mesh = new THREE.Mesh(
          new THREE.BoxGeometry(1, 1, 1),
          new THREE.MeshStandardMaterial({ color: 0x4a90e2 })
        );
        break;
      case 'effect':
        mesh = new THREE.Group();
        break;
      default:
        mesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.5),
          new THREE.MeshStandardMaterial({ color: 0xff6b6b })
        );
    }

    // Apply transform
    mesh.position.set(spatialObject.position.x, spatialObject.position.y, spatialObject.position.z);
    mesh.scale.set(spatialObject.scale.x, spatialObject.scale.y, spatialObject.scale.z);

    // Add to scene
    this.scene.add(mesh);
    this.objects.set(spatialObject.id, { spatial: spatialObject, mesh });

    this.eventBus.emit(EVENTS['spatial:object:spawn'], { objectId: spatialObject.id });

    return mesh;
  }

  /**
   * Remove object from world
   */
  public removeObject(objectId: string): boolean {
    const entry = this.objects.get(objectId);
    if (entry) {
      this.scene.remove(entry.mesh);
      this.objects.delete(objectId);
      this.eventBus.emit(EVENTS['spatial:object:remove'], { objectId });
      return true;
    }
    return false;
  }

  /**
   * Update object transform in world
   */
  public updateObjectTransform(objectId: string): boolean {
    const entry = this.objects.get(objectId);
    if (entry) {
      const { spatial, mesh } = entry;
      mesh.position.set(spatial.position.x, spatial.position.y, spatial.position.z);
      mesh.scale.set(spatial.scale.x, spatial.scale.y, spatial.scale.z);
      return true;
    }
    return false;
  }

  /**
   * Get object mesh
   */
  public getObjectMesh(objectId: string): THREE.Object3D | null {
    return this.objects.get(objectId)?.mesh ?? null;
  }

  /**
   * Render single frame
   */
  public render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Start render loop
   */
  public startRenderLoop(): void {
    const loop = () => {
      this.render();
      this.animationFrameId = requestAnimationFrame(loop);
    };
    loop();
  }

  /**
   * Stop render loop
   */
  public stopRenderLoop(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  /**
   * Handle window resize
   */
  private onWindowResize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  /**
   * Get scene
   */
  public getScene(): THREE.Scene {
    return this.scene;
  }

  /**
   * Get camera
   */
  public getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }
}
