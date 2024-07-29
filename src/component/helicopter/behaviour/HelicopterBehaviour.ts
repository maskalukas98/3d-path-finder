import {HelicopterParts} from "../Helicopter";


export class HelicopterBehaviour {
    private static readonly speedIncreasingFactor = 0.001

    public climbStarted = false

    private propellerSpeedTarget = 0.25
    private propellerSpeedCurrent = 0.1

    constructor(
        private helicopterParts: HelicopterParts,
        private eventEmitter: EventTarget,
    ) {}

    public rotatePropellers(): boolean {
        this.helicopterParts.propellers.main.rotation.y += this.propellerSpeedCurrent
        this.helicopterParts.propellers.side.rotation.y += this.propellerSpeedCurrent

        if(!this.climbStarted) {
            if (this.propellerSpeedCurrent < this.propellerSpeedTarget) {
                this.propellerSpeedCurrent += HelicopterBehaviour.speedIncreasingFactor
            } else {
                return true
            }
        }

        return false
    }
}