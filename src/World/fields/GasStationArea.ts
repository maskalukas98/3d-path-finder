import {Area, AreaProps} from "./Area";
import {GlobalProps} from "../../type";
import {GasStation} from "../../component/gasStation/GasStation";
import {Mesh, MeshStandardMaterial, PlaneGeometry} from "three";
import {Car} from "../../component/car/Car";

import {GasStationEvents} from "../../component/gasStation/GasStationEvents";


export class GasStationArea extends Area {
    public entered = false

    constructor(
        props: GlobalProps,
        floorPlane: Mesh<PlaneGeometry, MeshStandardMaterial>,
        readonly areaProps: AreaProps,
        private gasStation: GasStation,
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
        car.stopUpdate = true
        this.props.eventEmitter.dispatchEvent(new GasStationEvents.AreaGasStationEnteredEvent(this.gasStation))

        return true
    }

    destructor?(): void {
        throw new Error("Method not implemented.");
    }
}