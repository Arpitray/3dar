declare module 'mind-ar/dist/mindar-image-three.prod.js' {
  import * as THREE from 'three';

  export interface MindARThreeConfig {
    container: HTMLElement;
    imageTargetSrc: string;
    maxTrack?: number;
    uiLoading?: string;
    uiScanning?: string;
    uiError?: string;
  }

  export class MindARThree {
    constructor(config: MindARThreeConfig);
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.Camera;
    addAnchor(targetIndex: number): {
      group: THREE.Group;
      onTargetFound?: (callback: () => void) => void;
      onTargetLost?: (callback: () => void) => void;
    };
    start(): Promise<void>;
    stop(): void;
    pause(): void;
  }
}
declare module 'mind-ar' {
  export * from 'mind-ar/dist/mindar-image-three.prod.js';
}