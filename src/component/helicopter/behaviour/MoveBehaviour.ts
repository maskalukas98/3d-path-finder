import {Behaviour} from "../../../type";
import {Group, Vector2, Vector3} from "three";
import {Position} from "../../../util/Position";
import {HelicopterBehaviour} from "./HelicopterBehaviour";
import {HelicopterEvents} from "../HelicopterEvents";


export class MoveBehaviour implements Behaviour {
    private static readonly targetThreshold = 5
    private static readonly speedIncreasingFactor = 0.01
    private static readonly idleTiltAngle = 0

    private targetPosition!: number
    private speed = 0.7
    private tiltInFlight = 0.7
    private rotationSpeed = 0.1

    private isInTarget = false

    constructor(
        private model: Group,
        private eventEmitter: EventTarget,
        private carTargetPosition: Vector3,
        private helicopterBehaviour: HelicopterBehaviour
    ) {

        this.setCarTargetPosition()
    }

    public update(): void {
        this.helicopterBehaviour.rotatePropellers()
        this.rotate()

        if(!this.isInTarget) {
            this.move()
        }
    }

    private rotate(): void {
        const currentQuaternion = Position.rotate(this.targetPosition, this.tiltInFlight, this.rotationSpeed, this.model)

        if(this.isInTarget && currentQuaternion.z === 0) {
            this.eventEmitter.dispatchEvent(new Event(HelicopterEvents.Names.TargetReached))
        }
    }

    private move(): void {
        const targetPosition = this.carTargetPosition.clone();
        this.speed += MoveBehaviour.speedIncreasingFactor
        const nextPosition = Position.move(this.model, targetPosition, this.speed)

        const distSq = Position.distanceSquared(nextPosition.x, nextPosition.z, targetPosition.x, targetPosition.z);
        if (distSq <= MoveBehaviour.targetThreshold) {
            this.isInTarget = true
            this.rotationSpeed = 0.02
            this.tiltInFlight = MoveBehaviour.idleTiltAngle
            this.model.position.set(targetPosition.x, this.model.position.y, targetPosition.z)
        }
    }

    private setCarTargetPosition(): void {
        this.targetPosition = Position.getTargetAngle(this.model.position, this.carTargetPosition)
    }
}