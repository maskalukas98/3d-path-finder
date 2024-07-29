import {Behaviour} from "../../../type";
import {Clock} from "three";
import {HelicopterParts} from "../Helicopter";
import {HelicopterBehaviour} from "./HelicopterBehaviour";
import {HelicopterEvents} from "../HelicopterEvents";

export class StartBehaviour implements Behaviour {
    constructor(
        private helicopterParts: HelicopterParts,
        private eventEmitter: EventTarget,
        private helicopterBehaviour: HelicopterBehaviour
    ) {}

    update(clock: Clock, deltaTime: number) {
        if(this.helicopterBehaviour.rotatePropellers()){
            this.helicopterBehaviour.climbStarted = true
            this.eventEmitter.dispatchEvent(new Event(HelicopterEvents.Names.Started))
        }
    }
}