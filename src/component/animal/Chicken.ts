import {GlobalProps, LoadedModel} from "../../type";
import * as THREE from "three";
import {Animal} from "./Animal";



export class Chicken extends Animal {
    public static readonly modelName = "chicken"

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
                walk: model.animations.find(a => a.name === "chicken-move-action") as THREE.AnimationClip,
                jump: model.animations.find(a => a.name === "chicken-jump") as THREE.AnimationClip,
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