import {Behaviour} from "./Behaviour";
import * as THREE from "three";
import {Group} from "three";
import {AnimalState} from "./AnimalStateMachine";

export class JumpBehaviour extends Behaviour {
    private readonly movementSpeed = 0.05
    // forward
    private direction!: THREE.Vector3

    constructor(
        model: Group
    ) {
        super(model);
    }

    public update() {
        this.rotateModel()
        this.jump()
    }

    public getStateId(): AnimalState {
        return AnimalState.Jump
    }

    private jump(): void {
        this.direction = new THREE.Vector3(0, 0, 1);
        this.direction.applyQuaternion(this.model.quaternion);
        this.model.position.add(this.direction.multiplyScalar(this.movementSpeed));
    }
}