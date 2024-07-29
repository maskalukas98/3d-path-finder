import * as THREE from 'three';

export interface DestroyableComponent {
    animateDestroy(clock: THREE.Clock, deltaTime: number): void
}