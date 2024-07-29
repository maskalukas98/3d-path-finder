import {Area, AreaProps} from "./Area";
import {GlobalProps} from "../../type";
import {Mesh, MeshStandardMaterial, PlaneGeometry} from "three";
import {Light, Semaphore} from "../../component/semaphore/Semaphore";
import {Car} from "../../component/car/Car";
import {b} from "vite/dist/node/types.d-aGj9QkWt";


export class SemaphoreArea extends Area {
    constructor(
        props: GlobalProps,
        floorPlane: Mesh<PlaneGeometry, MeshStandardMaterial>,
        readonly areaProps: AreaProps,
        private semaphore: Semaphore,
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

        if(this.semaphore.getCurrentLight() !== Light.Go) {
            car.stopUpdate = true

            this.semaphore.addEventListener("light_changed", () => {
                if(this.semaphore.getCurrentLight() === Light.Go) {
                    car.stopUpdate = false
                }
            })
        } else {
            car.stopUpdate = false
        }

        return true
    }

    destructor?(): void {
        throw new Error("Method not implemented.");
    }
}