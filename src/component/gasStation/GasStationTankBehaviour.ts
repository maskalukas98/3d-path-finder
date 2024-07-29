import {Behaviour, GlobalProps, LoadedModel} from "../../type";
import * as THREE from "three";
import {AnimationClip, Clock, Mesh, Vector3} from "three";
import {GasState, GasStation} from "./GasStation";
import {Car} from "../car/Car";
import {AnimationAction} from "three/src/animation/AnimationAction";
import {GasStationCameraManager} from "./GasStationCameraManager";
import {Howler} from "howler";
import {Audio} from "../../Audio";
import {CarCameraManager, CarCameraViewType} from "../car/CarCameraManager";
import {Euler} from "three/src/math/Euler";
import {GasStationEvents} from "./GasStationEvents";

type Parts = {
    gasGun: Mesh,
    oil: Mesh
}

export class GasStationTankBehaviour implements Behaviour {
    private state = GasState.Idle

    private partMeshes: Parts
    private car: Car

    private elapsedTime = 0
    private actionGasHoseTankingAction: AnimationAction
    private actionGunTankingAction: AnimationAction

    private enterCarPosition: Vector3
    private enterCarRotation: Euler
    private enterCarCameraView?: CarCameraViewType

    constructor(
        private props: GlobalProps,
        private model: LoadedModel,
        private gasStation: GasStation,
    ) {

        this.actionGasHoseTankingAction = this.gasStation.mixer.clipAction(
            model.animations.find(s => s.name === "gas-hose-tanking.action") as AnimationClip
        )
        this.actionGasHoseTankingAction.loop = THREE.LoopRepeat
        this.actionGasHoseTankingAction.clampWhenFinished = false

        this.actionGunTankingAction = this.gasStation.mixer.clipAction(
            model.animations.find(s => s.name === "gas-gun-tanking.action") as AnimationClip
        )
        this.actionGunTankingAction.loop = THREE.LoopRepeat
        this.actionGunTankingAction.clampWhenFinished = false

        this.partMeshes = {
            gasGun: model.scene.getObjectByName("gas-gun") as Mesh,
            oil: model.scene.getObjectByName("oil") as Mesh,
        }

        this.car = props.container.getUpdatable("car")
        this.car.stopCar()
        this.enterCarPosition = this.car.getSceneModel().position.clone()
        this.enterCarRotation = this.car.getSceneModel().rotation.clone()
        const carMesh = this.car.getSceneModel()
        carMesh.position.x = this.model.scene.position.x - 7
        carMesh.position.z = this.model.scene.position.z - 11
        carMesh.rotation.y = 6.27

        if(props.camera.currentCameraManager.canBeOverTaken()) {
            if(props.camera.currentCameraManager instanceof CarCameraManager) {
                this.enterCarCameraView = props.camera.currentCameraManager.getView()
            }

            props.camera.setCameraManager(
                new GasStationCameraManager(props, carMesh.position)
            )
        }

        this.car.openGasDoor()

        setTimeout(() => {
            this.state = GasState.TankStart
        }, 500)
    }

    public update(clock: Clock, deltaTime: number) {
        this.elapsedTime += deltaTime

        if(this.state === GasState.TankStart) {
            Howler.stop()
            this.props.audio.play(Audio.GasPumpingSoundName)
            this.actionGasHoseTankingAction.play()
            this.actionGunTankingAction.play()
            this.state = GasState.TankProcess
        } else if(this.state === GasState.TankProcess) {
            if(this.elapsedTime >= 0.5) {
                if(this.partMeshes.oil.scale.y >= 0.1) {
                    if(this.partMeshes.oil.scale.y <= 0.4) {
                        this.state = GasState.TankStop
                    } else {
                        this.partMeshes.oil.scale.y -= 0.1
                    }
                }

                if(this.partMeshes.oil.position.y > 1) {
                    this.partMeshes.oil.position.y -= 0.05
                }

                this.elapsedTime = 0
            }
        } else if(this.state === GasState.TankStop) {
            this.partMeshes.oil.visible = false
            this.actionGunTankingAction.stop().reset()
            this.actionGasHoseTankingAction.stop().reset()
            this.props.audio.stop(Audio.GasPumpingSoundName)
            this.state = GasState.Idle
            this.gasStation.dispatchEvent(new Event(GasStationEvents.Names.TankingFinished))
            this.car.increaseFuel(Car.fuelDefault)
            this.car.startCar()
            this.car.setCamera(this.enterCarCameraView ?? CarCameraViewType.Above)
            this.car.getSceneModel().position.copy(this.enterCarPosition)
            this.car.getSceneModel().rotation.copy(this.enterCarRotation)
        }
    }
}