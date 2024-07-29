import {Behaviour} from "../../../type";
import {Group, Mesh} from "three";
import {Helicopter, HelicopterParts} from "../Helicopter";
import {HelicopterBehaviour} from "./HelicopterBehaviour";
import {HelicopterEvents} from "../HelicopterEvents";


export class LandingBehaviour implements Behaviour {
    private minHeight = 14
    private landingSpeed = 1
    private rotationSpeed = 0.05

    private landed = false

    constructor(
        private model: Group,
        private eventEmitter: EventTarget,
        private helicopterParts: HelicopterParts,
        private helicopterBehaviour: HelicopterBehaviour
    ) {}

    public update(): void {
        if(!this.landed) {
            this.helicopterBehaviour.rotatePropellers()

            if (this.minHeight < this.model.position.y) {
                this.model.position.y -= this.landingSpeed
            } else {
                this.landed = true
                this.helicopterParts.propellers.main.rotation.y = 10
                this.helicopterParts.propellers.side.rotation.y = 10
            }
        }

        if(this.landed) {
            if(this.helicopterParts.propellers.main.rotation.y > 0) {
                this.helicopterParts.propellers.main.rotation.y -= this.rotationSpeed
                this.helicopterParts.propellers.side.rotation.y -= this.rotationSpeed
            }  else {
                this.eventEmitter.dispatchEvent(
                    new Event(HelicopterEvents.Names.Stopped)
                )
            }
        }
    }
}