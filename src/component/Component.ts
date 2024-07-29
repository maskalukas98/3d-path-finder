import * as THREE from "three";
import {GlobalProps, LoadedModel} from "../type";
import {Group} from "three";
import {ThreejsObject} from "../util/ThreejsObject";

export abstract class Component extends EventTarget {
    protected constructor(
            private id: string,
            public readonly model: LoadedModel,
            props: GlobalProps,
        ) {
        super()
    }

    public getId(): string {
        return this.id
    }

    public getSceneModel(): Group {
        return this.model.scene
    }

    abstract isObstacle(): boolean

    public remove(): void {
        ThreejsObject.disposeNodeAndChildren(this.model.scene)
    }
}

export abstract class UpdatableComponent extends Component {
    public stopUpdate = false

    protected constructor(id: string, model: LoadedModel, props: GlobalProps) {
        super(id, model, props);
    }

    abstract handleInput(): void
    abstract update(clock: THREE.Clock, deltaTime: number): void
    abstract destructor?(): void

    public getStopUpdate(): boolean {
        return this.stopUpdate
    }

    public remove() {
        super.remove();
    }
}