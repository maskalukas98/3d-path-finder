import {AreaComponent, GlobalProps, LoadedModel, UnRegisterEvent} from "../../type";
import {UpdatableComponent} from "../Component";
import * as THREE from "three";
import {AnimationClip, Mesh, MeshBasicMaterial, MeshStandardMaterial, ShapeUtils, Vector3} from "three";
import {CarLights} from "./CarLights";
import {BufferGeometry} from "three/src/core/BufferGeometry";
import {CarDriverViewFacadeBehaviour} from "./CarDriverViewFacadeBehaviour";
import {Audio} from "../../Audio";
import {CarCameraManager, CarCameraViewType} from "./CarCameraManager";
import {Area} from "../../World/fields/Area";
import {Collision} from "../../algorithm/collision/Collision";
import {ShortestPath} from "../../algorithm/pathFinder/ShortestPath";
import {WorldsEvents} from "../../event/WorldEvents";
import {CarEvents} from "./CarEvents";
import {GameEvents} from "../../event/GameEvents";

export type CarMesh = Mesh<BufferGeometry, MeshStandardMaterial>;
type CarMeshBasic = Mesh<BufferGeometry, MeshBasicMaterial>;

export type CarParts = {
    steeringWheel: CarMesh,
    blinkLeft: CarMesh,
    blinkRight: CarMesh,
    gasSymbol: CarMesh,
    handLevel: CarMesh,
    speedIndicator: CarMeshBasic,
    animatedDriverLicence: CarMesh
    hand: CarMesh,
    gasDoor: CarMesh,
    hood: CarMesh,
    windowMostFront: CarMesh
}


export class Car extends UpdatableComponent implements AreaComponent, UnRegisterEvent {
    public static readonly modelName = "car"
    public static dashboardSymbolDefaultColor = 0x848484
    public static readonly fuelDefault = 100

    private static readonly turnSpeed = 0.05
    private static readonly wheelsRotationSpeed = 0.08
    private static readonly velocityDefault = 20
    private static readonly speeds = [0.3, 0.5, 0.8, 1, 1.2, 1.5, 1.9]
    private static readonly stoppingSpeedDefault = 1
    private static readonly stoppingSpeedFactor = 0.2
    private static readonly steeringWheelRotation = 0.05
    private static readonly fuelDecreaseBy = 10
    private static readonly fuelIncreaseBy = 30
    private static readonly checkIntervalOfEnterArea = 0.05
    private static readonly startCarEngineAudioAfterMs = 1500

    public readonly lights: CarLights
    public readonly parts: CarParts
    public autoMove = false

    private mixer: THREE.AnimationMixer
    private actionStartKey: THREE.AnimationAction
    private currSpeedIdx = 0
    private numberMaterials: MeshBasicMaterial[] = []
    private _driverViewFacadeBehaviour: CarDriverViewFacadeBehaviour | null = null
    private isCarMovingForward = false
    private wheelMeshes!: Mesh[]
    private wheelFronts!: Mesh[]
    private velocity = 20
    private stoppingSpeed = 1
    private braking = false
    private fuel = Car.fuelDefault
    private timeDriveTaken = 0
    private collision!: Collision
    private shortestPath?: ShortestPath
    private previousArea?: Area

    // handlers
    private onWorldCreatedHandler: () => void
    private onShortestPathFoundHandler: () => void

    constructor(
        private props: GlobalProps,
        model: LoadedModel,
        id: string
    ) {
        super(id, model, props)

        this.onWorldCreatedHandler = this.onWorldCreated.bind(this)
        this.onShortestPathFoundHandler = this.onShortestPathFound.bind(this)

        this.registerEventListeners()

        this.parts = this.getModelParts()
        this.mixer = new THREE.AnimationMixer(this.model.scene)
        this.lights = new CarLights(props, model)
        this.setWheelGroup()
        this.setFrontWindowsTransparent()
        this.parts.handLevel.layers.set(1)


        this.actionStartKey = this.mixer.clipAction(
            model.animations.find(s => s.name === "starting-car.action") as AnimationClip
        )
        this.actionStartKey.loop = THREE.LoopOnce
        this.actionStartKey.clampWhenFinished = true
        this.actionStartKey.timeScale = 5
        this.actionStartKey.play()

        // create numbers
        this.numberMaterials = this.props.resource.getClonedTexture("numbers").materials
        this.parts.speedIndicator.material = this.numberMaterials[this.currSpeedIdx]

        this.parts.hand.visible = false
        this.parts.animatedDriverLicence.visible = false


        this.stopCar()
    }

    handleInput(): void {
    }



    update(clock: THREE.Clock, deltaTime: number): void {
        this.mixer.update(deltaTime)

        if(this._driverViewFacadeBehaviour) {
            this._driverViewFacadeBehaviour.update(clock, deltaTime)
        }

        if(this.stopUpdate || this.fuel === 0) {
            return
        }

        this.timeDriveTaken += deltaTime
        if(this.timeDriveTaken >= Car.checkIntervalOfEnterArea) {
            this.checkEnterOfNewArea()
            this.timeDriveTaken = 0
        }

        if(this.parts.handLevel.userData.clicked) {
            this.parts.handLevel.userData.clicked = false
            this.changeSpeed()
        }

        if(!this.autoMove) {
            this.collision.detectAreas()
            this.collision.detectMapBorder()
        }


        if (this.props.input.keyState.ArrowUp) {
            this.moveCarForward()

        } else {
            if(this.isCarMovingForward) {
               this.slowCarAfterMovingForward()
            }
        }

        if (this.props.input.keyState.ArrowDown) {
            this.moveCarDown()
        }

        if (this.props.input.keyState.ArrowLeft) {
            this.moveCarLeft()
        }

        if (this.props.input.keyState.ArrowRight) {
            this.moveCarRight()
        }

        this.model.scene.updateMatrixWorld(true);
    }

    destructor?(): void {
        throw new Error("Method not implemented.");
    }

    public canBeWithMultipleComponentsInArea(): boolean {
        return false
    }

    public checkEnterOfNewArea(): void {
        const currentArea = this.props.world.getArea(this.model.scene.position)



        if(currentArea) {
            if(currentArea !== this.previousArea) {
                this.decreaseFuel()
                this.previousArea = currentArea
            }

            const entered = currentArea.onEnterArea(this)

            if(entered) {
                if(this.shortestPath) {
                    this.shortestPath.markRouteAsTaken(currentArea)
                }
            }
        }
    }

    public setCamera(type: CarCameraViewType): void {
        const camera = new CarCameraManager(this.props, this.model, this.parts.hood)
        camera.setCamera(type)

        if(type === CarCameraViewType.Driver) {
            this._driverViewFacadeBehaviour = new CarDriverViewFacadeBehaviour(
                this.props,
                this.model,
                this.parts,
                this.mixer
            )
        } else {
            if(this._driverViewFacadeBehaviour) {
                this._driverViewFacadeBehaviour.unRegisterEventListeners()
            }

            this._driverViewFacadeBehaviour = null
        }

        this.props.camera.setCameraManager(camera)
    }

    public openGasDoor(): void {
        //this.actionGasOpen.play()
    }

    public get driverViewFacade(): CarDriverViewFacadeBehaviour | null {
        return this._driverViewFacadeBehaviour;
    }

    public changeSpeed(): void {
        if(this.currSpeedIdx + 1 < Car.speeds.length) {
            this.currSpeedIdx++
        } else {
            this.currSpeedIdx = 1
        }

        this.parts.speedIndicator.material = this.numberMaterials[this.currSpeedIdx]
        this._driverViewFacadeBehaviour?.pedalBehaviour?.playChangeSpeedAnimation()
    }

    public getSpeed(): number {
        return this.currSpeedIdx
    }

    public getRealSpeed(): number {
        return Car.speeds[this.currSpeedIdx]
    }

    public startCar(): void {
        this.actionStartKey.play()
        this.props.audio.play(Audio.CarStartSoundName)

        setTimeout(() => {
            this.stopUpdate = false
           this.props.audio.play(Audio.CarDriveSoundName)
        }, Car.startCarEngineAudioAfterMs)
    }

    public stopCar(): void {
        this.stopUpdate = true
        this.props.audio.stop(Audio.CarStartSoundName)
        this.props.audio.stop(Audio.CarDriveSoundName)
        this.actionStartKey.stop().reset()
    }

    public increaseFuel(val: number): void {
        const newFuel = val

        if(newFuel > Car.fuelDefault) {
            this.fuel = Car.fuelDefault
        } else {
            this.fuel = newFuel
        }

        this.props.eventEmitter.dispatchEvent(new CarEvents.DecreasedFuelEvent(this.fuel))
    }

    isObstacle(): boolean {
        return true;
    }

    remove() {
        super.remove();

        if(this._driverViewFacadeBehaviour) {
            this._driverViewFacadeBehaviour.unRegisterEventListeners()
        }
    }

    public unRegisterEventListeners() {
        this.props.eventEmitter.removeEventListener(WorldsEvents.Names.worldCreated, this.onWorldCreatedHandler)
        this.props.eventEmitter.removeEventListener(WorldsEvents.Names.ShortestPathFound, this.onShortestPathFoundHandler)

        if(this._driverViewFacadeBehaviour) {
            this._driverViewFacadeBehaviour.unRegisterEventListeners()
        }
    }

    private registerEventListeners(): void {
        this.props.eventEmitter.addEventListener(WorldsEvents.Names.worldCreated, this.onWorldCreatedHandler)
        this.props.eventEmitter.addEventListener(WorldsEvents.Names.ShortestPathFound, this.onShortestPathFoundHandler)
    }

    private decreaseFuel(): void {
        const newFuel = this.fuel -= Car.fuelDecreaseBy

        if(newFuel <= 0) {
            this.fuel = 0
            this.props.eventEmitter.dispatchEvent(new Event(GameEvents.Names.Defeat))
        } else {
            this.fuel = newFuel
            this.props.eventEmitter.dispatchEvent(new CarEvents.DecreasedFuelEvent(this.fuel))
        }
    }

    private slowCarAfterMovingForward(): void {
        if(!this.braking) {
            this.props.audio.play(Audio.CarBrakeSoundName)
            this.braking = true
        }

        if(this._driverViewFacadeBehaviour) {
            this._driverViewFacadeBehaviour.pedalBehaviour?.stopSpeedPedalAnimation()
        }


        const forward = new THREE.Vector3(1, 0, 0);
        forward.applyQuaternion(this.model.scene.quaternion);

        if(this.stoppingSpeed > 0.3) {
            this.stoppingSpeed -= Car.stoppingSpeedFactor
        }

        this.model.scene.position.add(forward.multiplyScalar(this.stoppingSpeed));

        this.wheelMeshes.forEach(wheel => {
            wheel.rotation.z += Car.wheelsRotationSpeed
        })
        this.velocity--

        if(this.velocity === 0) {
            this.isCarMovingForward = false
            this.stoppingSpeed = Car.stoppingSpeedDefault
            this.braking = false
        }
    }

    private moveCarLeft(): void {
        this.model.scene.rotation.y += Car.turnSpeed;

        this.wheelFronts.forEach(wheel => {
            wheel.rotation.y = Math.min(0.5, this.wheelFronts[0].rotation.y + Car.wheelsRotationSpeed)
        })

        this.parts.steeringWheel.rotation.x -= Car.steeringWheelRotation
    }

    private moveCarRight(): void {
        this.model.scene.rotation.y -= Car.turnSpeed;

        this.wheelFronts.forEach(wheel => {
            wheel.rotation.y = Math.max(-0.5, this.wheelFronts[0].rotation.y - Car.wheelsRotationSpeed)
        })
        this.parts.steeringWheel.rotation.x += Car.steeringWheelRotation
    }

    private moveCarDown(): void {
        const backward = new THREE.Vector3(-1, 0, 0);
        backward.applyQuaternion(this.model.scene.quaternion);
        this.model.scene.position.add(backward.multiplyScalar(Car.speeds[this.currSpeedIdx]));

        this.wheelMeshes.forEach(wheel => {
            wheel.rotation.z -= Car.wheelsRotationSpeed
            wheel.rotation.x = 0
            wheel.rotation.y = 0
            wheel.updateMatrixWorld(true)
        })
    }

    private moveCarForward(): void {
        if(this._driverViewFacadeBehaviour) {
            this._driverViewFacadeBehaviour.pedalBehaviour?.startSpeedPedalAnimation()
        }

        const forward = new THREE.Vector3(1, 0, 0);
        forward.applyQuaternion(this.model.scene.quaternion);
        this.model.scene.position.add(forward.multiplyScalar(Car.speeds[this.currSpeedIdx]));

        this.wheelMeshes.forEach(wheel => {
            wheel.rotation.z += Car.wheelsRotationSpeed
            wheel.rotation.x = 0
            wheel.rotation.y = 0
        })

        this.isCarMovingForward = true
        this.velocity = Car.velocityDefault
    }

    private setWheelGroup(): void {
        const frontLeft = this.model.scene.getObjectByName("wheelfront-left") as Mesh
        const frontRight = this.model.scene.getObjectByName("wheelfront-right") as Mesh

        this.wheelMeshes = [
            this.model.scene.getObjectByName("wheel001_1") as Mesh,
            this.model.scene.getObjectByName("wheel003_1") as Mesh,
            frontLeft,
            frontRight
        ]

        this.wheelFronts = [
            frontLeft,
            frontRight
        ]
    }

    private getModelParts(): CarParts {
        return {
            steeringWheel: this.model.scene.getObjectByName("steering-wheel") as Mesh<BufferGeometry, MeshStandardMaterial>,
            blinkLeft: this.model.scene.getObjectByName("blink-left") as Mesh<BufferGeometry, MeshStandardMaterial>,
            blinkRight: this.model.scene.getObjectByName("blink-right") as Mesh<BufferGeometry, MeshStandardMaterial>,
            gasSymbol: this.model.scene.getObjectByName("gas-symbol") as Mesh<BufferGeometry, MeshStandardMaterial>,
            handLevel: this.model.scene.getObjectByName("hand-lever") as Mesh<BufferGeometry, MeshStandardMaterial>,
            speedIndicator: this.model.scene.getObjectByName("speed-indicator") as CarMeshBasic,
            animatedDriverLicence: this.model.scene.getObjectByName("driver-licence001") as CarMesh,
            hand: this.model.scene.getObjectByName("hand") as CarMesh,
            gasDoor: this.model.scene.getObjectByName("car-gas-door") as CarMesh,
            hood: this.model.scene.getObjectByName("hood") as CarMesh,
            windowMostFront: this.model.scene.getObjectByName("window-most-front") as CarMesh
        }
    }

    private setFrontWindowsTransparent(): void {
        const m = this.parts.windowMostFront.material
        m.transparent =  true
        m.roughness = 0.1
        m.metalness = 0
        m.opacity = 0.3
    }

    private onWorldCreated(): void {
        this.collision = new Collision(this.props, this)
    }

    private onShortestPathFound(): void {
        this.shortestPath = this.props.container.getUpdatableLogic("shortest_path") as ShortestPath
    }
}