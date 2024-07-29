import {Mesh, MeshStandardMaterial, Vector3} from "three";
import {GlobalProps, LoadedModel} from "../../type";
import {BufferGeometry} from "three/src/core/BufferGeometry";
import {CameraManager} from "../../Camera";

export enum CarCameraViewType {
    None,
    Above,
    Driver
}

export class CarCameraManager implements CameraManager {
    private hoodPosition = new Vector3()

    constructor(
        private props: GlobalProps,
        private model: LoadedModel,
        private hoodMesh: Mesh<BufferGeometry, MeshStandardMaterial>,
        private view = CarCameraViewType.None
    ) {}

    update(): void {
        if(this.view === CarCameraViewType.Driver) {
            this.hoodMesh.getWorldPosition(this.hoodPosition)
            this.props.camera.setCarDriverView(this.model.scene.position, this.model.scene.rotation)
        } else if(this.view === CarCameraViewType.Above) {
            this.props.camera.getCamera().position.z = this.model.scene.position.z - 20
            this.props.camera.getCamera().position.x = this.model.scene.position.x
            this.props.camera.getCamera().position.y = 50

            this.props.camera.getCamera().lookAt(this.model.scene.position.clone())
        }
    }

    public setCamera(type: CarCameraViewType) {
        this.view = type
    }

    public getView(): CarCameraViewType {
        return this.view
    }

    public canBeOverTaken(): boolean {
        return true
    }
}