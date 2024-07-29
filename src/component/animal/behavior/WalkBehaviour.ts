import {Behaviour} from "./Behaviour";
import {Group} from "three";
import * as THREE from "three";
import {AnimalState} from "./AnimalStateMachine";

export class WalkBehaviour extends Behaviour {
    private readonly movementSpeed = 0.05
    // forward
    private direction = new THREE.Vector3(0, 0, 1);

    constructor(
        model: Group
    ) {
        super(model);
    }

    public update() {
        this.rotateModel()
        this.walk()
    }

    public getStateId(): AnimalState {
        return AnimalState.Walk
    }

    private walk(): void {
        this.direction = new THREE.Vector3(0, 0, 1);
        this.direction.applyQuaternion(this.model.quaternion);
        this.model.position.add(this.direction.multiplyScalar(this.movementSpeed));
    }
}