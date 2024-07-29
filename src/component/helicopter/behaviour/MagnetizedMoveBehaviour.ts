import {Behaviour, GlobalProps} from "../../../type";
import {Clock, Group, Mesh, Vector3} from "three";
import * as THREE from "three";
import {Car} from "../../car/Car";
import {Position} from "../../../util/Position";
import {HelicopterBehaviour} from "./HelicopterBehaviour";
import {Target} from "../../Target";
import {HelicopterEvents} from "../HelicopterEvents";

export class MagnetizedMoveBehaviour implements Behaviour {
    private static targetThreshold = 3

    private targetPosition: THREE.Vector3
    private targetAngle: number
    private speed = 0.7
    private tiltInFlight = 0
    private rotationSpeed = 0.1

    constructor(
        private props: GlobalProps,
        private model: Group,
        private eventEmitter: EventTarget,
        private car: Car,
        private helicopterBehaviour: HelicopterBehaviour
    ) {
        const targetComponent = props.container.getUpdatableComponents().find(s => s instanceof Target)


        if(!targetComponent) {
            throw new Error("Target not found!")
        }

        this.targetPosition = targetComponent.getSceneModel().position
        this.targetAngle = Position.getTargetAngle(this.model.position, this.targetPosition)
    }

    update(clock: Clock, deltaTime: number) {
        this.helicopterBehaviour.rotatePropellers()
        Position.rotate(this.targetAngle, this.tiltInFlight, this.rotationSpeed, this.model)
        this.move()
    }

    private move(): void {
        const nextPosition = Position.move(this.model, this.targetPosition, this.speed)
        this.speed += 0.01
        this.car.getSceneModel().position.set(nextPosition.x, this.car.getSceneModel().position.y, nextPosition.z)

        const distSq = Position.distanceSquared(nextPosition.x, nextPosition.z, this.targetPosition.x, this.targetPosition.z);
        if (distSq <= MagnetizedMoveBehaviour.targetThreshold) {
            this.rotationSpeed = 0.02
            this.tiltInFlight = 0
            this.model.position.set(this.targetPosition.x, this.model.position.y, this.targetPosition.z)
            this.eventEmitter.dispatchEvent(new Event(HelicopterEvents.Names.MagnetizedInTarget))
        }
    }
}