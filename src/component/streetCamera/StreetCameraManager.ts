import {CameraManager} from "../../Camera";
import {Vector3} from "three";
import {GlobalProps, LoadedModel} from "../../type";
import {StreetCamera, StreetCameraParts} from "./StreetCamera";
import {StreetCameraEvents} from "./StreetCameraEvents";

enum View  {
    Display
}

export class StreetCameraManager implements CameraManager {
    private realPos = new Vector3()

    constructor(
        private props: GlobalProps,
        public readonly streetCamera: StreetCamera
    ) {
    }

    public update() {
        this.updateStreetCameraDisplayView(this.streetCamera.target.position)
    }

    public canBeOverTaken(): boolean {
        return false
    }

    onStart() {
        this.streetCamera.parts.row.getWorldPosition(this.realPos)
        this.props.camera.getCamera().position.set(this.realPos.x, this.realPos.y + 55, this.realPos.z);
        this.props.camera.getCamera().zoom = 1

        this.streetCamera.parts.cameraHolder.visible = false
        this.streetCamera.parts.camera.visible = false
        this.streetCamera.parts.cameraDisplay.visible = false

        this.props.camera.controls.enableZoom = false
        this.props.camera.controls.enablePan = false
        this.props.camera.controls.enableRotate = false

        this.updateStreetCameraDisplayView(this.streetCamera.target.position)
        this.props.eventEmitter.dispatchEvent(
            new StreetCameraEvents.DisplayViewStartedEvent(this.streetCamera)
        )
    }

    public updateStreetCameraDisplayView(targetObjectPosition: Vector3): void {
        this.streetCamera.parts.row.getWorldPosition(this.realPos)
        this.props.camera.getCamera().position.set(this.realPos.x, this.realPos.y + 55, this.realPos.z);

        const clonedTarget = targetObjectPosition.clone()
        this.props.camera.getCamera().lookAt(clonedTarget)
        this.props.camera.controls.target = clonedTarget
        this.props.camera.controls.update()

        this.props.camera.getCamera().updateProjectionMatrix()
    }
}