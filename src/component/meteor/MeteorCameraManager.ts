import {CameraManager} from "../../Camera";
import {GlobalProps} from "../../type";
import {Meteor} from "./Meteor";
import {Vector3} from "three";

export class MeteorCameraManager implements CameraManager {
    constructor(
        private props: GlobalProps,
        private meteor: Meteor,
        private plusPosition: Vector3
    ) {}

    public update() {}

    public start(): void {
        const meteorPosition = this.meteor.getSceneModel().position.clone()
        meteorPosition.x += this.plusPosition.x
        meteorPosition.z += this.plusPosition.z

        if(this.plusPosition.y !== 0) {
            meteorPosition.y += this.plusPosition.y
        }

        this.props.camera.getCamera().position.copy(meteorPosition);
        this.props.camera.getCamera().lookAt(this.meteor.getSceneModel().position)
    }

    public canBeOverTaken(): boolean {
        return false
    }
}