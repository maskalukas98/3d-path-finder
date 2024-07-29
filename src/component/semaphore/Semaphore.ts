import {UpdatableComponent} from "../Component";
import {AreaComponent, GlobalProps, LoadedModel} from "../../type";
import {Color, Mesh, MeshStandardMaterial} from "three";
import {BufferGeometry} from "three/src/core/BufferGeometry";
import {SemaphoreEvents} from "./SemaphoreEvents";

type CircleMesh =  Mesh<BufferGeometry, MeshStandardMaterial>

export enum Light {
    Stop,
    Caution,
    Go,
    PrepareToStop,
    None
}

export class Semaphore extends UpdatableComponent implements AreaComponent  {
    public static readonly modelName = "semaphore"
    private debug = false

    private redCircleMesh!: CircleMesh
    private orangeCircleMesh!: CircleMesh
    private greenCircleMesh!: CircleMesh

    private currentLight = Light.Stop

    private colorMap = {
        red: new Color(1, 0.014, 0.014),
        orange: new Color(1,0.63,0.086 ),
        green: new Color(0.03, 1,0.077),
    }

    private  maxInterval = 60
    private currentInterval = 0

    constructor(
         props: GlobalProps,
         model: LoadedModel,
         id: string
    ) {
        super(id, model, props)

        this.redCircleMesh = model.scene.getObjectByName("red-circle") as CircleMesh
        this.orangeCircleMesh = model.scene.getObjectByName("orange-circle") as CircleMesh
        this.greenCircleMesh = model.scene.getObjectByName("green-circle") as CircleMesh

        this.setNextLight()
    }


    handleInput(): void {
    }

    update(): void {
        this.currentInterval++

        if(this.currentInterval === this.maxInterval) {
            this.setNextLight()
            this.currentInterval = 0
        }
    }

    destructor?(): void {
        throw new Error("Method not implemented.");
    }

    public canBeWithMultipleComponentsInArea(): boolean {
        return false
    }

    public getCurrentLight(): Light {
        return this.currentLight
    }

    public isObstacle(): boolean {
        return false;
    }

    private setNextLight(): void {
        switch (this.currentLight) {
            case Light.None:
                this.currentInterval = Light.Stop
                this.hideLight(this.orangeCircleMesh)
                this.hideLight(this.greenCircleMesh)
                this.maxInterval = 60
                break;
            case Light.Stop:
                this.currentLight = Light.Caution;
                this.orangeCircleMesh.material.emissive.copy(this.colorMap.orange)
                this.maxInterval = 40
                break;
            case Light.Caution:
                this.currentLight = Light.Go;
                this.greenCircleMesh.material.emissive.copy(this.colorMap.green)
                this.hideLight(this.redCircleMesh)
                this.hideLight(this.orangeCircleMesh)
                this.maxInterval = 160
                break;
            case Light.Go:
                this.currentLight = Light.PrepareToStop;
                this.orangeCircleMesh.material.emissive.copy(this.colorMap.orange)
                this.hideLight(this.greenCircleMesh)
                this.maxInterval = 60
                break;
            case Light.PrepareToStop:
                this.currentLight = Light.Stop;
                this.redCircleMesh.material.emissive.copy(this.colorMap.red)
                this.hideLight(this.orangeCircleMesh)
                this.maxInterval = 60
                break;
        }

        this.dispatchEvent(new SemaphoreEvents.LightChangedEvent(this.currentLight))
    }

    private hideLight(mesh: CircleMesh): void {
        mesh.material.emissive.r = 0
        mesh.material.emissive.g = 0
        mesh.material.emissive.b = 0
    }
}