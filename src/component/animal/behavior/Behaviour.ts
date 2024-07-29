import {Group} from "three";
import * as THREE from "three";
import {AnimalState} from "./AnimalStateMachine";

export abstract class Behaviour {
    protected targetRotation!: number
    private readonly rotationSpeed = 0.05

    protected constructor(
        protected model: Group
    ) {
        this.chooseRandomDirection()
    }

    abstract update(): void
    abstract getStateId(): AnimalState

    protected rotateModel(): void {
        const currentQuaternion = this.model.quaternion;
        const targetQuaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, this.targetRotation, 0));
        const factor = Math.min(1, this.rotationSpeed / currentQuaternion.angleTo(targetQuaternion));
        currentQuaternion.slerp(targetQuaternion, factor);

        this.model.setRotationFromQuaternion(currentQuaternion);
    }

    public setNewTargetRotation(val: number): void {
        this.targetRotation = val
    }

    public chooseRandomDirection(): void {
        this.targetRotation = Math.random() * 2 * Math.PI
    }

}