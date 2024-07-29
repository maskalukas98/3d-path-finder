import {UpdatableComponent} from "./Component";
import {AreaComponent, GlobalProps, LoadedModel} from "../type";
import {Clock, Mesh, MeshStandardMaterial} from "three";
import {BufferGeometry} from "three/src/core/BufferGeometry";

type TargetMesh = Mesh<BufferGeometry, MeshStandardMaterial>

export class Target extends UpdatableComponent implements AreaComponent {
    public static readonly modelName = "target"
    public static readonly maxCreatedInstances = 1

    constructor(
        private props: GlobalProps,
        model: LoadedModel,
        id: string
    ) {
        super(id, model, props);

        const mesh = model.scene.children[0] as TargetMesh
        mesh.material.transparent = true
        mesh.material.opacity = 0.3
    }

    destructor(): void {
    }

    handleInput(): void {
    }

    update(clock: Clock, deltaTime: number): void {
    }

    public canBeWithMultipleComponentsInArea(): boolean {
        return false
    }

    public isObstacle(): boolean {
        return false;
    }

    public remove(): void {
        super.remove()
        this.props.world.numberOfTargets--
    }
}