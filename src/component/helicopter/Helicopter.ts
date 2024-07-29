import {UpdatableComponent} from "../Component";
import {Behaviour, GlobalProps, LoadedModel, UnRegisterEvent} from "../../type";
import {Clock, Group, Mesh} from "three";
import {IdleBehaviour} from "../behaviour/IdleBehaviour";
import {FlyBehaviour} from "./behaviour/FlyBehaviour";
import {Car} from "../car/Car";
import {HelicopterCameraView} from "./HelicopterCameraView";
import {Audio} from "../../Audio";
import {HelicopterEvents} from "./HelicopterEvents";
import {TargetEvents} from "../target/TargetEvents";

export type HelicopterParts = {
    propellers: {
        side: Mesh,
        main: Mesh
    },
    rope: Mesh,
    magnet: Mesh
}

export class Helicopter extends UpdatableComponent implements UnRegisterEvent {
    public static readonly modelName = "helicopter"
    public static readonly floorY = 9.5

    private localEventEmitter = new EventTarget()
    private behaviour: Behaviour = new IdleBehaviour()
    private parts: HelicopterParts

    // handlers
    private onStoppedHelicopterHandler: () => void

    constructor(
        private props: GlobalProps,
        model: LoadedModel,
        id: string
    ) {
        super(id, model, props);
        this.onStoppedHelicopterHandler = this.onStoppedHelicopter.bind(this)

        this.parts = {
            propellers: {
                side: model.scene.getObjectByName("propeller-side") as Mesh,
                main:  model.scene.getObjectByName("propeller-main") as Mesh
            },
            rope: model.scene.getObjectByName("rope") as Mesh,
            magnet: model.scene.getObjectByName("magnet") as Mesh
        }

        this.parts.rope.visible = false
        this.parts.magnet.visible = false

        this.registerEventListeners()
    }

    destructor(): void {
    }

    handleInput(): void {
    }

    update(clock: Clock, deltaTime: number): void {
        this.behaviour.update(clock, deltaTime)
    }

    public isObstacle(): boolean {
        return false;
    }

    public startFlyForCar(): void {
        if(this.behaviour instanceof FlyBehaviour) {
            return
        }

        const car = this.props.container.getUpdatable<Car>("car")

        this.behaviour = new FlyBehaviour(
            this.props,
            this.model.scene,
            this.parts,
            car,
            this.localEventEmitter
        )
    }

    public setCamera(): void {
        this.props.camera.setCameraManager(new HelicopterCameraView(this.props, this.model))
    }

    public unRegisterEventListeners() {
        this.localEventEmitter.removeEventListener(HelicopterEvents.Names.Stopped, this.onStoppedHelicopterHandler)
    }

    private registerEventListeners(): void {
        this.localEventEmitter.addEventListener(HelicopterEvents.Names.Stopped, this.onStoppedHelicopterHandler)
    }

    private onStoppedHelicopter(): void {
        this.behaviour = new IdleBehaviour()
        this.props.camera.returnPreviousCameraManager()
        this.props.audio.stop(Audio.HelicopterBladeSoundName)
        this.props.eventEmitter.dispatchEvent(new Event(HelicopterEvents.Names.Stopped))
        this.props.eventEmitter.dispatchEvent(new Event(TargetEvents.Names.Entered))
    }
}