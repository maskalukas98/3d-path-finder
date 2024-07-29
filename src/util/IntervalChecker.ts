import * as THREE from 'three';

export class IntervalChecker {
    private lastCheckTime = 0

    constructor(
        public checkInterval: number,
    ) {}

    check(clock: THREE.Clock) {
        const elapsedTime = clock.getElapsedTime();

        if (elapsedTime - this.lastCheckTime >= this.checkInterval) {
            this.lastCheckTime = Math.floor(elapsedTime / this.checkInterval) * this.checkInterval;
            return true;
        }

        return false;
    }

    public reset(checkInterval: number) {
        this.checkInterval = checkInterval
    }
}