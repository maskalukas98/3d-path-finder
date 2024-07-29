import {UpdatableComponent} from "../Component";
import {Behaviour, BehaviourStop, GlobalProps, isBehaviourStop, LoadedModel, UnRegisterEvent} from "../../type";
import {Debug} from "../../util/debug";
import * as THREE from "three";
import {Fire} from "../Fire";
import {MeteorFlyBehaviour} from "./MeteorFlyBehaviour";
import {IdleBehaviour} from "../behaviour/IdleBehaviour";
import {Audio} from "../../Audio";
import {MeteorEvents} from "./MeteorEvents";



export class Meteor extends UpdatableComponent implements UnRegisterEvent {
    public static readonly modelName = "stone"

    public readonly mixer: THREE.AnimationMixer
    private behaviour: Behaviour = new IdleBehaviour()

    // handlers
    private readonly onMeteorFlyFinishedHandler: () => void

    constructor(
        private readonly props: GlobalProps,
        model: LoadedModel,
    ) {
        super("stone", model, props)
        this.onMeteorFlyFinishedHandler = this.onMeteorFlyFinished.bind(this)

        this.mixer = new THREE.AnimationMixer(this.model.scene);
        this.registerEventListeners()
    }

    destructor(): void {
    }

    handleInput(): void {
    }

    update(clock: THREE.Clock, deltaTime: number): void {
        this.mixer.update(deltaTime)
        this.behaviour.update(clock, deltaTime)
    }

    public start(): void {
        this.behaviour = new MeteorFlyBehaviour(this.props,this.model, this.mixer)
    }

    public isObstacle(): boolean {
        return false;
    }

    public unRegisterEventListeners() {
        this.props.eventEmitter.removeEventListener(MeteorEvents.Names.FlyFinished, this.onMeteorFlyFinishedHandler)
    }

    private stop(): void {
        if(isBehaviourStop(this.behaviour)) {
            this.behaviour.destructor()
        }

        this.behaviour = new IdleBehaviour()
        this.props.camera.returnPreviousCameraManager()
        this.props.audio.stop(Audio.MeteorHitSoundName)
    }

    private registerEventListeners(): void {
        this.props.eventEmitter.addEventListener(MeteorEvents.Names.FlyFinished, this.onMeteorFlyFinishedHandler)
    }

    private onMeteorFlyFinished(): void {
        this.stop()
        Howler.stop()
        this.props.audio.play(Audio.GameMusic)
    }
}