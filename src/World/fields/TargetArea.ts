import {Area, AreaProps} from "./Area";
import {GlobalProps} from "../../type";
import {Mesh, MeshStandardMaterial, PlaneGeometry} from "three";
import {Car} from "../../component/car/Car";
import {Target} from "../../component/Target";



export class TargetArea extends Area {
    constructor(
        props: GlobalProps,
        floorPlane: Mesh<PlaneGeometry, MeshStandardMaterial>,
        readonly areaProps: AreaProps,
        private target: Target,
    ) {
        super(
            props,
            floorPlane,
            areaProps
        );
    }

    public onEnterArea(car: Car): boolean {
        if(this.entered) {
            return false
        }

        this.entered = true

        setTimeout(() => {
            this.props.eventEmitter.dispatchEvent(new Event("target_entered"))
            car.getSceneModel().position.x = this.target.getSceneModel().position.x
            car.getSceneModel().position.z = this.target.getSceneModel().position.z
        }, 250)

        return true
    }

    destructor?(): void {
        throw new Error("Method not implemented.");
    }
}