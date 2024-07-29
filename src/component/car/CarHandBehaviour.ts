import {Behaviour, GlobalProps, LoadedModel} from "../../type";
import * as THREE from "three";
import {AnimationClip, Clock} from "three";
import {CarParts} from "./Car";

export class CarHandBehaviour implements Behaviour {
    private static readonly duration = 1.5

    private actionHandShowLicence: THREE.AnimationAction
    private actionHandHideLicence: THREE.AnimationAction
    private actionHandMoveLicence: THREE.AnimationAction

    constructor(
        private props: GlobalProps,
        private model: LoadedModel,
        private parts: CarParts,
        private mixer: THREE.AnimationMixer
    ) {
        this.actionHandShowLicence = this.mixer.clipAction(
            model.animations.find(s => s.name === "hand-show-licence.action") as AnimationClip
        )
        this.actionHandShowLicence.loop = THREE.LoopOnce
        this.actionHandShowLicence.clampWhenFinished = true


        this.actionHandMoveLicence = this.mixer.clipAction(
            model.animations.find(s => s.name === "driver-licence-move.action") as AnimationClip
        )
        this.actionHandMoveLicence.loop = THREE.LoopOnce
        this.actionHandMoveLicence.clampWhenFinished = true

        this.actionHandHideLicence = this.mixer.clipAction(
            model.animations.find(s => s.name === "driver-licenceAction.003") as AnimationClip
        )
        this.actionHandHideLicence.loop = THREE.LoopOnce
        this.actionHandHideLicence.clampWhenFinished = true
    }

    public update(clock: Clock, deltaTime: number) {
        if(this.actionHandMoveLicence.isRunning()) {
            let elapsedTime = this.actionHandMoveLicence.time;

            if (elapsedTime >= CarHandBehaviour.duration / 2 && elapsedTime < CarHandBehaviour.duration) {
                this.parts.animatedDriverLicence.position.y = -200
                this.parts.animatedDriverLicence.visible = true
            }
        }
    }

    public playAll(): void {
        this.parts.hand.visible = true

        this.actionHandShowLicence.play()
        this.actionHandMoveLicence.play()
        this.actionHandHideLicence.play()
    }

    public reset(): void {
        this.parts.hand.visible = false
        this.parts.animatedDriverLicence.visible = false

        this.actionHandShowLicence.stop().reset()
        this.actionHandMoveLicence.stop().reset()
        this.actionHandHideLicence.stop().reset()
    }
}