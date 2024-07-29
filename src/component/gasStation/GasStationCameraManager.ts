import {CameraManager} from "../../Camera";
import {GlobalProps} from "../../type";
import {Vector3} from "three";
import {CarMesh} from "../car/Car";

export class GasStationCameraManager implements CameraManager {
    constructor(
        private props: GlobalProps,
        private carPos: Vector3
    ) {
    }

    update() {
    }

    onStart(): void {
        const lookAtPos = this.carPos.clone()
        lookAtPos.y = 10

        this.props.camera.getCamera().position.z = this.carPos.z + 5
        this.props.camera.getCamera().position.x = this.carPos.x - 20
        this.props.camera.getCamera().position.y = 40

        this.props.camera.getCamera().lookAt(this.carPos.clone())
    }

    canBeOverTaken(): boolean {
        return false
    }
}