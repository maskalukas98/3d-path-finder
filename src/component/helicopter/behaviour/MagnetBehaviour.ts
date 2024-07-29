import {Behaviour} from "../../../type";
import {Clock, Group, Mesh, Vector3} from "three";
import * as THREE from "three";
import {Car} from "../../car/Car";
import {Position} from "../../../util/Position";
import {HelicopterParts} from "../Helicopter";
import {HelicopterBehaviour} from "./HelicopterBehaviour";
import {HelicopterEvents} from "../HelicopterEvents";


// SEPARATE THIS CLASS TO MULTIPLE PARTS!!!
export class MagnetBehaviour implements Behaviour {
    private static targetThreshold = 25

    private down = true
    private wait = false
    private up = false
    private drop = false

    private waitCounter = 0
    private maxHeight = 100


    constructor(
        private model: Group,
        private eventEmitter: EventTarget,
        private helicopterParts: HelicopterParts,
        private car: Car,
        private helicopterBehaviour: HelicopterBehaviour
    ) {
    }

    update(clock: Clock, deltaTime: number) {
        this.helicopterBehaviour.rotatePropellers()

        if(this.down) {
            this.helicopterParts.magnet.visible = true
            this.helicopterParts.rope.visible = true

            if(this.model.position.y > this.car.getSceneModel().position.y + 25) {
                this.model.position.y -= 1
            } else {
                this.down = false
                this.wait = true
            }
        }

        if(this.wait) {
            this.waitCounter++

            if(this.waitCounter === 40) {
                this.wait = false
                this.up = true
            }
        }

        if(this.up) {
            if(this.model.position.y < this.maxHeight) {
                this.model.position.y += 1
                this.car.getSceneModel().position.y += 1
            } else {
                this.up = false
                this.eventEmitter.dispatchEvent(new Event(HelicopterEvents.Names.MagnetizedFinished))
            }
        }

        if(this.drop) {
            if(this.car.getSceneModel().position.y > Position.floorY) {
                this.model.position.y -= 1
                this.car.getSceneModel().position.y -= 1
            } else {
                this.eventEmitter.dispatchEvent(new Event(HelicopterEvents.Names.MagnetizedDropped))
            }
        }
    }

    public startDrop(): void {
        this.resetAll()
        this.drop = true
    }

    private resetAll(): void {
        this.down = false
        this.wait = false
        this.up = false
        this.drop = false
    }
}