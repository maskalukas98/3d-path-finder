import {AnimationClip, Clock} from "three";
import * as THREE from "three";
import {GlobalProps, LoadedModel} from "../../type";
import {CarParts} from "./Car";

export class CarPedalBehaviour {
    private actionHandLevel: THREE.AnimationAction
    private actionLeftPedal: THREE.AnimationAction
    public readonly actionSpeedPedal: THREE.AnimationAction

    constructor(
        private props: GlobalProps,
        private model: LoadedModel,
        private parts: CarParts,
        private mixer: THREE.AnimationMixer
    ) {
        this.actionHandLevel = this.mixer.clipAction(
            model.animations.find(s => s.name === "hand-level.action") as AnimationClip
        )
        this.actionHandLevel.loop = THREE.LoopOnce

        this.actionLeftPedal = this.mixer.clipAction(
            model.animations.find(s => s.name === "pedal.action") as AnimationClip
        )
        this.actionLeftPedal.loop = THREE.LoopOnce

        this.actionSpeedPedal = this.mixer.clipAction(
            model.animations.find(s => s.name === "pedal-foot-right.action") as AnimationClip
        )
        this.actionSpeedPedal.loop = THREE.LoopOnce
        this.actionSpeedPedal.clampWhenFinished = true
    }

    public update(clock: Clock, deltaTime: number) {

    }

    public playChangeSpeedAnimation(): void {
        this.actionHandLevel.play().reset()
        this.actionLeftPedal.play().reset()
    }

    public stopSpeedPedalAnimation(): void {
        this.actionSpeedPedal.clampWhenFinished = false
        this.actionSpeedPedal.stop()
    }

    public startSpeedPedalAnimation(): void {
        this.actionSpeedPedal.clampWhenFinished = true
        this.actionSpeedPedal.play()
    }
}