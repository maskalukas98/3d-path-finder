import {GlobalProps, LoadedModel} from "../../type";
import {BufferGeometry} from "three/src/core/BufferGeometry";
import {CameraManager} from "../../Camera";
import {Car} from "../car/Car";


export class HelicopterCameraView implements CameraManager {
    constructor(
        private props: GlobalProps,
        private model: LoadedModel,
    ) {}

    update(): void {
        this.props.camera.getCamera().position.z = this.model.scene.position.z + 70
        this.props.camera.getCamera().position.x = this.model.scene.position.x + 40
        this.props.camera.getCamera().position.y = this.model.scene.position.y + 30

        this.props.camera.getCamera().lookAt(this.model.scene.position.clone())
    }

    onStart() {
        const car = this.props.container.getUpdatable("car") as Car
        car.stopCar()
    }

    public canBeOverTaken(): boolean {
        return false
    }
}