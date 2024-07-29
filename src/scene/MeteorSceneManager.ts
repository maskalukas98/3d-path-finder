import {Meteor} from "../component/meteor/Meteor";
import {GlobalProps} from "../type";
import {Position} from "../util/Position";
import {House} from "../component/house/House";
import {MeteorCameraManager} from "../component/meteor/MeteorCameraManager";
import {Vector3} from "three";
import {Howler} from "howler";
import {Audio} from "../Audio";
import {HouseEvents} from "../component/house/HouseEvents";


export class MeteorSceneManager {
    private meteor!: Meteor
    private meteorsCounter = 0

    constructor(
        private props: GlobalProps
    ) {
        this.props.eventEmitter.addEventListener("meteor_view_completed", () => {
            this.markTargetHouse()
        })
    }

    private markTargetHouse(): void {
        const houses = this.props.container.getUpdatableComponents().filter(s => s instanceof House && !s.isDestroyed())

        if(houses.length === 0) {
            throw new Error("House not found.")
        }

        const randomIndex = Math.floor(Math.random() * houses.length);
        const house = houses[randomIndex] as unknown as House;

        this.props.eventEmitter.dispatchEvent(new HouseEvents.ViewEvent(house))
    }

    public start(): boolean {
        if(this.meteorsCounter === this.props.container.getUpdatableComponents().filter(s => s instanceof House).length) {
            return false
        }

        Howler.stop()
        this.props.audio.play(Audio.MeteorFlySoundName)
        this.meteor = this.createMeteor(-500, -500, 500)
        this.meteor.start()
        this.lookAtMeteor(this.meteor,40, 20)
        this.meteorsCounter++
        return true
    }

    private createMeteor(x: number, z: number, y = Position.floorY): Meteor {
        const loadedModel = this.props.resource.getClonedModel(Meteor.modelName)
        const meteor = new Meteor(this.props, loadedModel)

        loadedModel.scene.position.x = x
        loadedModel.scene.position.z = z
        loadedModel.scene.position.y = y
        loadedModel.scene.rotation.y = -1.5
        loadedModel.scene.scale.setScalar(4)

        this.props.container.addUpdatableComponent(meteor, loadedModel.scene)
        return meteor
    }

    private lookAtMeteor(meteor: Meteor, plusX: number, plusZ: number, plusY: number = 0): void {
        const cameraManager = new MeteorCameraManager(
            this.props,
            meteor,
            new Vector3(plusX, plusY, plusZ)
        )

        cameraManager.start()
        this.props.camera.setCameraManager(cameraManager)
    }
}