import {Behaviour, BehaviourStop, GlobalProps, LoadedModel, UnRegisterEvent} from "../../type";
import {Clock, Group, Vector3} from "three";
import {Fire} from "../Fire";
import * as THREE from "three";
import {Phase} from "../../util/Phase";
import {Position} from "../../util/Position";
import {DestroyableComponent} from "../../type/behaviourTypes";
import {UpdatableComponent} from "../Component";
import {Audio} from "../../Audio";
import {HouseEvents} from "../house/HouseEvents";
import {MeteorEvents} from "./MeteorEvents";


export class MeteorFlyBehaviour implements Behaviour, BehaviourStop, UnRegisterEvent {
    private speed = 0.15
    private speedY = 0.05
    private fire: Fire
    private targetObject!: UpdatableComponent & DestroyableComponent
    private action: THREE.AnimationAction

    private phaseFirstView = new Phase()
    private phaseSecondView = new Phase()
    private phaseFarView = new Phase()
    private phaseHouseView = new Phase()
    private phaseHitView = new Phase()
    private phaseAfterHitView = new Phase()

    private closeFireTime = 3
    private elapsedCloseFireTime = 0
    private allFinished = false

    // handler
    private readonly onHouseViewStartedHandler: (e: Event) => void

    constructor(
        private props: GlobalProps,
        private model: LoadedModel,
        private mixer: THREE.AnimationMixer,
    ) {
        this.onHouseViewStartedHandler = this.onHouseViewStarted.bind(this)

        this.registerEventListeners()

        this.fire = new Fire(model.scene)
        this.fire.createFire()

        this.phaseFirstView.start()

        this.action = this.mixer.clipAction(model.animations[0]);
        this.action.loop = THREE.LoopRepeat
        this.action.clampWhenFinished = false;
        this.action.play()
    }

    public update(clock: Clock, deltaTime: number) {
        if(this.allFinished) {
            return
        }

        this.fire.update()

        if(this.phaseFirstView.hasStarted()) {
            this.model.scene.position.z += this.speed
            this.model.scene.position.x += this.speed
            this.model.scene.position.y -= this.speedY

            if(this.model.scene.position.x > -465) {
                this.phaseFirstView.stop()
                this.phaseSecondView.start()
                this.speed = 0.8
            }
        } else if(this.phaseSecondView.hasStarted()) {
            this.model.scene.position.z += this.speed
            this.model.scene.position.x += this.speed
            this.model.scene.position.y -= this.speedY

            if(this.model.scene.position.x < -350) {
                const stonePosition = this.model.scene.position.clone()
                stonePosition.z -= 5
                stonePosition.x -= 15
                stonePosition.y += 20
                this.props.camera.getCamera().position.copy(stonePosition)
                this.props.camera.getCamera().lookAt(this.model.scene.position)
            } else {
                this.phaseSecondView.stop()
                this.phaseFarView.start()
                this.props.eventEmitter.dispatchEvent(new Event(MeteorEvents.Names.ViewCompleted))
            }
        } else if(this.phaseFarView.hasStarted()) {
            if(this.phaseFarView.isBefore()) {
                this.speed = 3
                this.phaseFarView.completeBefore()
            }

            if(this.model.scene.position.x < -200) {
                Position.moveXYZ(this.model.scene, this.targetObject.getSceneModel().position, this.speed)
            } else {
                this.phaseFarView.stop()
                this.phaseHouseView.start()
            }
        } else if(this.phaseHouseView.hasStarted()) {
            this.props.audio.stop(Audio.MeteorFlySoundName)

            if(this.phaseHouseView.isBefore()) {
                this.speed = 5
                this.phaseHouseView.completeBefore()
            }

            const cameraTargetPosition = this.targetObject.getSceneModel().position.clone()
            cameraTargetPosition.y += 40
            cameraTargetPosition.z += 40
            cameraTargetPosition.x += 40
            this.props.camera.getCamera().lookAt(this.targetObject.getSceneModel().position)
            this.props.camera.getCamera().position.copy(cameraTargetPosition)
            Position.moveXYZ(this.model.scene, this.targetObject.getSceneModel().position, this.speed)

            if(this.model.scene.position.y < 10) {
                this.phaseHouseView.stop()
                this.phaseHitView.start()
                this.props.audio.play(Audio.MeteorHitSoundName)
            }
        } else if(this.phaseHitView.hasStarted()) {
            if(this.phaseHitView.isBefore()) {
                this.phaseHitView.completeBefore()
            }

            this.targetObject.animateDestroy(clock, deltaTime)
            this.phaseHitView.stop()
            this.action.stop()

            this.fire.positionLimit = -5
            this.fire.increaseSizes()
            this.phaseAfterHitView.start()
        } else if(this.phaseAfterHitView.hasStarted()) {
            this.elapsedCloseFireTime += deltaTime

            if (this.elapsedCloseFireTime >= this.closeFireTime) {
                this.fire.stop()
                this.allFinished = true
                this.props.eventEmitter.dispatchEvent(new Event(MeteorEvents.Names.FlyFinished))
            }
        }
    }

    public unRegisterEventListeners() {
        this.props.eventEmitter.removeEventListener(HouseEvents.Names.ViewStarted, this.onHouseViewStartedHandler)
    }

    public destructor() {
        this.action.stop()
    }

    private registerEventListeners(): void {
        this.props.eventEmitter.addEventListener(HouseEvents.Names.ViewStarted, this.onHouseViewStartedHandler)
    }

    private onHouseViewStarted(e: Event): void {
        const event = e as HouseEvents.ViewEvent
        this.targetObject = event.targetObject as UpdatableComponent & DestroyableComponent
    }
}