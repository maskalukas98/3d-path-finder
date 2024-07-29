import {AreaComponent, GlobalProps, LoadedModel} from "../../type";
import {Component, UpdatableComponent} from "../Component";
import {DestroyableComponent} from "../../type/behaviourTypes";
import {Clock, Group, Mesh, MeshStandardMaterial} from "three";
import * as THREE from "three";
import {BufferGeometry} from "three/src/core/BufferGeometry";

type PartMesh = Mesh<BufferGeometry, MeshStandardMaterial>

type Parts = {
    house: PartMesh,
    roof: PartMesh,
    treeCrown: PartMesh,
    treeStump: PartMesh,
    door: PartMesh,
    windows: PartMesh,
    doorHandle: PartMesh
}

export class House extends UpdatableComponent implements DestroyableComponent, AreaComponent {
    public static readonly modelName = "house"

    private static readonly darkBlackColor = 0x000000
    private static readonly lightBlackColor = 0x333333

    private mixer: THREE.AnimationMixer;
    private action: THREE.AnimationAction;
    private action2: THREE.AnimationAction;
    private destroyed = false
    private parts: Parts

    private destroyableDarkParts: PartMesh[]
    private destroyableLightParts: PartMesh[]

    constructor(
        props: GlobalProps,
        model: LoadedModel,
        id: string
    ) {
        super(id, model, props)
        this.mixer = new THREE.AnimationMixer(model.scene)
        this.action = this.mixer.clipAction(model.animations[0]);
        this.action2 = this.mixer.clipAction(model.animations[4]);

        this.parts = {
            house: model.scene.getObjectByName("house") as PartMesh,
            roof: model.scene.getObjectByName("roof") as PartMesh,
            treeCrown: model.scene.getObjectByName("tree-crown") as PartMesh,
            treeStump: model.scene.getObjectByName("tree-stump") as PartMesh,
            door: model.scene.getObjectByName("door") as PartMesh,
            windows: model.scene.getObjectByName("windows") as PartMesh,
            doorHandle: model.scene.getObjectByName("handle") as PartMesh
        }

        this.destroyableDarkParts  = [
            this.parts.house,
            this.parts.treeCrown,
            this.parts.treeStump,
            this.parts.doorHandle
        ]

        this.destroyableLightParts = [
            ...this.parts.roof.children  as PartMesh[],
            ...this.parts.windows.children as PartMesh[],
            ...this.parts.door.children as PartMesh[]
        ]
    }

    handleInput(): void {
    }

    update(clock: THREE.Clock, deltaTime: number): void {
        this.mixer.update(deltaTime)
    }

    destructor?(): void {
        throw new Error("Method not implemented.");
    }

    public canBeWithMultipleComponentsInArea(): boolean {
        return false
    }

    public animateDestroy() {
        if(this.isDestroyed()) {
            return
        }

        this.action2.loop = THREE.LoopOnce
        this.action2.clampWhenFinished = true;
        this.action2.play()

        this.action.loop = THREE.LoopOnce
        this.action.clampWhenFinished = true;
        this.action.play();

        this.mixer.addEventListener('finished', () => {
            this.destroyableDarkParts.forEach(child => child.material.color.set(House.darkBlackColor))
            this.destroyableLightParts.forEach(child => child.material.color.set(House.lightBlackColor))
            this.destroyed = true
        });
    }

    public isDestroyed(): boolean {
        return this.destroyed
    }

    isObstacle(): boolean {
        return true;
    }
}