import {Behaviour, GlobalProps, UnRegisterEvent} from "../../../type";
import {Clock, Group, Mesh, Vector3} from "three";
import {ClimbBehaviour} from "./ClimbBehaviour";
import {MoveBehaviour} from "./MoveBehaviour";
import {MagnetBehaviour} from "./MagnetBehaviour";
import {Car} from "../../car/Car";
import {MagnetizedMoveBehaviour} from "./MagnetizedMoveBehaviour";
import {Position} from "../../../util/Position";
import {LandingBehaviour} from "./LandingBehaviour";
import {Helicopter, HelicopterParts} from "../Helicopter";
import {HelicopterBehaviour} from "./HelicopterBehaviour";
import {StartBehaviour} from "./StartBehaviour";
import {Buildings} from "../../../World/Buildings";
import {Audio} from "../../../Audio";
import {Howler} from "howler";
import {HelicopterEvents} from "../HelicopterEvents";




export class FlyBehaviour implements Behaviour, UnRegisterEvent {
    private readonly helicopterBehaviour: HelicopterBehaviour
    private magnetizedDropped = false
    private behaviour: Behaviour

    // handlers
    private readonly onClimbedHandler: () => void
    private readonly onTargetReachedHandler: () => void
    private readonly onMagnetizedFinishedHandler: () => void
    private readonly onMagnetizedInTargetHandler: () => void
    private readonly onMagnetizedDroppedHandler: () => void
    private readonly onHelicopterStartedHandler: () => void

    constructor(
        private props: GlobalProps,
        private model: Group,
        private helicopterParts: HelicopterParts,
        private car: Car,
        private eventEmitter: EventTarget,
    ) {
        this.onClimbedHandler = this.onClimbed.bind(this)
        this.onTargetReachedHandler = this.onTargetReached.bind(this)
        this.onMagnetizedFinishedHandler = this.onMagnetizedFinished.bind(this)
        this.onMagnetizedInTargetHandler = this.onMagnetizedInTarget.bind(this)
        this.onMagnetizedDroppedHandler = this.onMagnetizedDropped.bind(this)
        this.onHelicopterStartedHandler = this.onHelicopterStarted.bind(this)

        Howler.stop()
        props.audio.play(Audio.HelicopterBladeSoundName, 0.7, { from: 0, to: 0.7, duration: 3000 })
        this.helicopterBehaviour = new HelicopterBehaviour(helicopterParts, this.eventEmitter)
        this.behaviour = new StartBehaviour(helicopterParts, this.eventEmitter, this.helicopterBehaviour)

        this.registerEventListeners()
    }

    public update(clock: Clock, deltaTime: number) {
        if(this.car) {
            if(!this.car.stopUpdate) {
                this.car.stopUpdate = true
            }
        }

        this.behaviour.update(clock, deltaTime)
    }

    public unRegisterEventListeners() {
        this.eventEmitter.removeEventListener(HelicopterEvents.Names.Climbed, this.onClimbedHandler)
        this.eventEmitter.removeEventListener(HelicopterEvents.Names.TargetReached, this.onTargetReachedHandler)
        this.eventEmitter.removeEventListener(HelicopterEvents.Names.MagnetizedFinished, this.onMagnetizedFinishedHandler)
        this.eventEmitter.removeEventListener(HelicopterEvents.Names.MagnetizedInTarget, this.onMagnetizedInTarget)
        this.eventEmitter.removeEventListener(HelicopterEvents.Names.MagnetizedDropped, this.onMagnetizedDroppedHandler)
        this.eventEmitter.removeEventListener(HelicopterEvents.Names.Started, this.onHelicopterStartedHandler)
    }

    private registerEventListeners(): void {
        this.eventEmitter.addEventListener(HelicopterEvents.Names.Climbed, this.onClimbedHandler)
        this.eventEmitter.addEventListener(HelicopterEvents.Names.TargetReached, this.onTargetReachedHandler)
        this.eventEmitter.addEventListener(HelicopterEvents.Names.MagnetizedFinished, this.onMagnetizedFinishedHandler)
        this.eventEmitter.addEventListener(HelicopterEvents.Names.MagnetizedInTarget, this.onMagnetizedInTargetHandler)
        this.eventEmitter.addEventListener(HelicopterEvents.Names.MagnetizedDropped, this.onMagnetizedDroppedHandler)
        this.eventEmitter.addEventListener(HelicopterEvents.Names.Started, this.onHelicopterStartedHandler)
    }

    private onClimbed(): void {
        let targetPosition: Vector3

        if(this.magnetizedDropped) {
            targetPosition = Buildings.heliportPosition
        } else {
            targetPosition = this.car.getSceneModel().position
        }

        this.behaviour = new MoveBehaviour(
            this.model,
            this.eventEmitter,
            targetPosition,
            this.helicopterBehaviour
        )
    }

    private onTargetReached(): void {
        if(this.magnetizedDropped) {
            this.behaviour = new LandingBehaviour(
                this.model,
                this.eventEmitter,
                this.helicopterParts,
                this.helicopterBehaviour
            )
        } else {
            this.behaviour = new MagnetBehaviour(
                this.model,
                this.eventEmitter,
                this.helicopterParts,
                this.car,
                this.helicopterBehaviour
            )
        }
    }

    private onMagnetizedFinished(): void {
        this.behaviour = new MagnetizedMoveBehaviour(
            this.props,
            this.model,
            this.eventEmitter,
            this.car,
            this.helicopterBehaviour
        )
    }

    private onMagnetizedInTarget(): void {
        const magnetBehaviour = new MagnetBehaviour(
            this.model,
            this.eventEmitter,
            this.helicopterParts,
            this.car,
            this.helicopterBehaviour
        )

        magnetBehaviour.startDrop()
        this.behaviour = magnetBehaviour
    }

    private onMagnetizedDropped(): void {
        this.magnetizedDropped = true
        this.behaviour =  new ClimbBehaviour(
            this.model,
            this.eventEmitter,
            this.helicopterParts,
            this.helicopterBehaviour
        )
    }

    private onHelicopterStarted(): void {
        this.behaviour =  new ClimbBehaviour(this.model, this.eventEmitter, this.helicopterParts, this.helicopterBehaviour)
    }
}