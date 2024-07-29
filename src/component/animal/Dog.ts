import {GlobalProps, LoadedModel} from "../../type";
import {Debug} from "../../util/debug";
import * as THREE from "three";
import {AnimationAction} from "three/src/animation/AnimationAction";
import {Animal} from "./Animal";
import {AnimationClip} from "three";
import {AnimalStateMachine} from "./behavior/AnimalStateMachine";

type ActionClips = {
    jump: AnimationClip,
    walk: AnimationClip
}

export class Dog extends Animal {
    public static readonly modelName = "dog"

    constructor(
        props: GlobalProps,
        model: LoadedModel,
        id: string,
        fieldPos: { x: number, z: number }
    ) {
        super(
            props,
            model,
            id,
            fieldPos,
            {
                walk: model.animations.find(a => a.name === "dog-move-action") as THREE.AnimationClip,
                jump: model.animations.find(a => a.name === "dog-jump") as THREE.AnimationClip,
            }
        )
    }

    handleInput(): void {
    }

    update(clock: THREE.Clock, deltaTime: number): void {
        super.update(clock, deltaTime)
    }

    destructor() {
    }
}