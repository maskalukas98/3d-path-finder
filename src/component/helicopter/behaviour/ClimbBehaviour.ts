import {Group, Mesh} from "three";
import {Behaviour} from "../../../type";
import * as THREE from "three";
import {HelicopterParts} from "../Helicopter";
import {HelicopterBehaviour} from "./HelicopterBehaviour";
import {HelicopterEvents} from "../HelicopterEvents";

export class ClimbBehaviour implements Behaviour {
    private maxHeight = 100
    private climbSpeedTarget = 1
    private climbSpeedCurrent = 0.9

    constructor(
        private model: Group,
        private eventEmitter: EventTarget,
        private helicopterParts: HelicopterParts,
        private helicopterBehaviour: HelicopterBehaviour
    ) {
        this.helicopterParts.rope.visible = false
        this.helicopterParts.magnet.visible = false
    }

    public update(): void {
        this.helicopterBehaviour.rotatePropellers()

        if(this.climbSpeedCurrent < this.climbSpeedTarget) {
            this.climbSpeedCurrent += 0.005
        }

        if (this.maxHeight > this.model.position.y) {
            this.model.position.y += this.climbSpeedCurrent
        } else {
            this.eventEmitter.dispatchEvent(new Event(HelicopterEvents.Names.Climbed))
        }

    }
}