import {GlobalProps} from "./type";
import {Car} from "./component/car/Car";
import {StreetCameraControls} from "./component/streetCamera/StreetCameraControls";
import * as THREE from "three";
import {Helicopter} from "./component/helicopter/Helicopter";
import {MeteorSceneManager} from "./scene/MeteorSceneManager";
import {GasStationControls} from "./component/gasStation/GasStationControls";
import {StreetCameraManager} from "./component/streetCamera/StreetCameraManager";
import {CarCameraManager, CarCameraViewType} from "./component/car/CarCameraManager";
import {EditModeControls} from "./World/editMode/EditModeControls";
import {StreetCamera} from "./component/streetCamera/StreetCamera";
import {CarEvents} from "./component/car/CarEvents";
import {WorldsEvents} from "./event/WorldEvents";
import {StreetCameraEvents} from "./component/streetCamera/StreetCameraEvents";
import {CameraNormalManager} from "./Camera";
import * as toastr from "toastr";
import {GameEvents} from "./event/GameEvents";
import {Target} from "./component/Target";

// TODO: REWRITE TO REACT!!!!!!!!!

export class ControlsBar {
    public static clonedGameUi: Node

    private carLightBtn!: HTMLElement
    private streetCameraControls?: StreetCameraControls;
    private gasStationControls: GasStationControls
    private editModeControls: EditModeControls
    private car!: Car

    public registerCarEvents(): void {
        // click
        this.carLightBtn = document.getElementById("car-light-btn") as HTMLElement
        this.carLightBtn.addEventListener("click", () => {
            const car = this.props.container.getUpdatable<Car>("car")
            car.lights.switchVisible()
        })

        ControlsBar.getElementById("car-driver-view-btn").addEventListener("click", () => {
            this.streetCameraControls?.clear()
            this.car.setCamera(CarCameraViewType.Driver)
        })

        ControlsBar.getElementById("car-above-view-btn").addEventListener("click", () => {
            this.streetCameraControls?.clear()
            const car = this.props.container.getUpdatable<Car>("car")
            car.setCamera(CarCameraViewType.Above)
        })

        ControlsBar.getElementById("world-view-btn").addEventListener("click", () => {
            this.streetCameraControls?.clear()
            this.streetCameraControls = undefined

            this.props.camera.setCameraManager(
                new CameraNormalManager(this.props)
            )
        })

        ControlsBar.getElementById("car-show-licence-btn").addEventListener("click", () => {
            const currCamManager = this.props.camera.currentCameraManager
            const car = this.props.container.getUpdatable<Car>("car")

            let driverView = false

            if(currCamManager instanceof CarCameraManager && currCamManager.getView() === CarCameraViewType.Driver) {
                driverView = true
            }

            if(!driverView) {
                toastr.info("To display the driver's license, you must switch to the driver's view.")
            } else {
                car.driverViewFacade?.showDriverLicence()
            }
        })

        ControlsBar.getElementById("car-change-speed-btn").addEventListener("click", () => {
            this.changeSpeed()
        })

        const stopCarBtn = ControlsBar.getElementById("stop-car-btn")
        stopCarBtn.addEventListener("click", () => {
            const engine = this.car.getStopUpdate()

            if(!engine) {
                this.car.stopCar()
                this.setCarEngineVisibility(true)
            } else {
                this.car.startCar()
                this.setCarEngineVisibility(false)
            }
        })

        // others
        this.props.eventEmitter.addEventListener(CarEvents.Names.DecreasedFuel, (e) => {
            this.setGas(
                (e as CarEvents.DecreasedFuelEvent).newFuelValue
            )
        })
    }

    public registerGlobalEvents(): void {
        this.props.eventEmitter.addEventListener(WorldsEvents.Names.worldCreated, () => {
            this.car = this.props.container.getUpdatable<Car>("car")

            this.setSoundVisibility(this.props.audio.getIsAudioAllowed())
            this.setCarEngineVisibility(true)
            this.setStartGameVisibility(this.props.started)
            this.setStartAutoGameVisibility(this.car.autoMove)
            this.editModeControls.setEditModeVisibility()
            this.changeSpeed()
            this.setGas(Car.fuelDefault)
        })
    }

    public static cloneGameUi(): void {
        const clonedElement = document.getElementById("game-ui")

        if(clonedElement) {
            ControlsBar.clonedGameUi = clonedElement.cloneNode(true)
        }
    }

    public static refreshHtml(): void {
        const gameUi = document.getElementById("game-ui")

        if(gameUi) {
            gameUi.remove()
        }

        document.body.appendChild(ControlsBar.clonedGameUi.cloneNode(true))
    }

    constructor(
        public props: GlobalProps
    ) {
        this.editModeControls = new EditModeControls(props)
        this.gasStationControls = new GasStationControls(props)

        this.registerCarEvents()
        this.registerGlobalEvents()


        ControlsBar.getElementById("sound-btn").addEventListener("click", () => {
            const permission = props.audio.toggleAudioPermission()
            this.setSoundVisibility(permission)
        })

        ControlsBar.getElementById("edit-mode-btn").addEventListener("click", () => {
            this.streetCameraControls?.clear()

            this.props.editMode.setActive(!this.props.editMode.active)
            this.editModeControls.setEditModeVisibility()

            this.props.camera.setCameraManager(
                new CameraNormalManager(this.props)
            )
        })

        ControlsBar.getElementById("helicopter-btn").addEventListener("click", () => {
            this.onClickStartHelicopter()
        })

        const meteorBtn =  ControlsBar.getElementById("meteor-btn")
        const meteorSceneManager = new MeteorSceneManager(props)
        meteorBtn.addEventListener("click", () => {
            if(!meteorSceneManager.start()) {
                return
            }

            this.setDisableForStreetCameraButtons(true)
            this.hideAllButtonsInLeftBar()

            props.eventEmitter.addEventListener("meteor_fly_finished", () => {
                this.showAllButtonsInLeftBar()
                this.setDisableForStreetCameraButtons(false)
            })
        })

        props.eventEmitter.addEventListener(StreetCameraEvents.Names.DisplayViewStarted, (e) => {
           this.streetCameraControls?.clear()


            const event = e as StreetCameraEvents.DisplayViewStartedEvent
            this.streetCameraControls = new StreetCameraControls(props, event.streetCamera)
            this.recreateStreetCameraDisplayButtons()
        })

        props.eventEmitter.addEventListener(StreetCameraEvents.Names.Created, (e) => {
            const streetCamera = (e as StreetCameraEvents.CreatedEvent).streetCamera
            this.createStreetCameraDisplayButton(streetCamera)
        })

        props.eventEmitter.addEventListener(StreetCameraEvents.Names.Removed, (e) => {
            this.recreateStreetCameraDisplayButtons()
        })

        ControlsBar.getElementById("start-btn").addEventListener("click", () => {
            const car = this.getCar()
            const target = this.getTarget()

            if(!car || !target) {
                return
            }

            let start = !this.props.started

            if(start) {
                this.props.eventEmitter.dispatchEvent(new GameEvents.GameStarted("manual"))
                this.hideButtonsAfterStart()
                this.showRunningButtons()
                this.setCarEngineVisibility(false)
            } else {
                this.props.eventEmitter.dispatchEvent(new Event("game_stopped"))
                this.setCarEngineVisibility(true)
            }

            this.editModeControls.clear()
            this.setStartGameVisibility(start)
        })

        ControlsBar.getElementById("start-auto-btn").addEventListener("click", () => {
            const car = this.getCar()
            const target = this.getTarget()

            if(!car || !target) {
                return
            }

            let start = !this.props.started

            if(start) {
                this.props.eventEmitter.dispatchEvent(new GameEvents.GameStarted("auto"))
                this.showRunningButtons()
                this.setCarEngineVisibility(false)
            } else {
                this.props.eventEmitter.dispatchEvent(new Event("game_stopped"))
                this.setCarEngineVisibility(true)
            }

            this.editModeControls.clear()
            this.hideButtonsAfterStart()
            //this.setStartGameVisibility(start)
        })

        ControlsBar.getElementById("restart-btn").addEventListener("click", () => {
            this.streetCameraControls?.clear()
            this.streetCameraControls = undefined
            this.recreateStreetCameraDisplayButtons(false)
            this.car = undefined as any
            this.props.app.stop()
            this.showAllButtonsInLeftBar()
            ControlsBar.getElementById("victory").style.display = "none"
            ControlsBar.getElementById("defeat").style.display = "none"
            this.props.eventEmitter.dispatchEvent(new Event("game_restarted"))
        })

        props.eventEmitter.addEventListener("target_entered", () => {
            this.showWinMessage()
        })

        props.eventEmitter.addEventListener("game_defeat", () => {
            this.showDefeatMessage()
        })

        props.eventEmitter.addEventListener(WorldsEvents.Names.ShortestPathProcess, e => {
            const newRoute = e as WorldsEvents.ShortestPathProcessEvent
            const { currentTakenRoutes, totalRoutes } = newRoute
            const percentage = (currentTakenRoutes / totalRoutes) * 100
            ControlsBar.getElementById("car-road-bar-inside").style.width = percentage + "%"
        })
    }

    public update(clock: THREE.Clock, deltaTime: number): void {
        if(this.streetCameraControls) {
            this.streetCameraControls.update(clock, deltaTime)
        }
    }

    public changeSpeed(): void {
        const car = this.props.container.getUpdatable<Car>("car")
        car.changeSpeed()
        ControlsBar.getElementById("car-speed-value").textContent = this.car.getSpeed().toString()
    }

    public static getElementById(id: string): HTMLElement {
        const element = document.getElementById(id)

        if(!element) {
            throw new Error("HTML button with id " + id +" is missing.")
        }

        return element
    }

    private showWinMessage(): void {
        this.hideAllButtonsInLeftBar()
        ControlsBar.getElementById("restart-btn").classList.remove("disabled")
        ControlsBar.getElementById("victory").style.display = "block"
    }

    private showDefeatMessage(): void {
        this.hideAllButtonsInLeftBar()
        ControlsBar.getElementById("restart-btn").classList.remove("disabled")
        ControlsBar.getElementById("defeat").style.display = "block"
    }

    private recreateStreetCameraDisplayButtons(create: boolean = true): void {
        const buttons = ControlsBar.getElementById("camera-list-section").querySelectorAll(".camera-display-btn")

        buttons.forEach(button => {
          button.remove()
        })

        if(create) {
            const streetCameras = this.props.container.getUpdatableComponents().filter(s => s instanceof StreetCamera)
            streetCameras.forEach(streetCamera => {
                this.createStreetCameraDisplayButton(streetCamera as StreetCamera)
            })
        }
    }

    private createStreetCameraDisplayButton(streetCamera: StreetCamera): void {
        const newSpan = document.createElement("span")
        newSpan.classList.add("camera-display-btn")
        const cameraId = streetCamera.getId()
        newSpan.classList.add("btn")
        newSpan.textContent = cameraId

        newSpan.addEventListener("click", () => {
            const currCameraManager = this.props.camera.currentCameraManager
            if(currCameraManager instanceof StreetCameraManager) {
                if(currCameraManager.streetCamera.getId() === cameraId) {
                    return
                } else {
                    currCameraManager.streetCamera.clear()
                    currCameraManager.streetCamera.switchToDefaultCamera()
                }
            }

            ControlsBar.getElementById("camera-display-section").style.display = "flex"

            const newCameraStreetManager = new StreetCameraManager(
                this.props,
                streetCamera
            )
            streetCamera.switchToDisplayViewCamera()
            this.props.camera.setCameraManager(newCameraStreetManager)
        })

        ControlsBar.getElementById("camera-list-section").appendChild(newSpan)
    }

    private setSoundVisibility(isAudioAllowed: boolean): void {
        const soundOff = ControlsBar.getElementById("sound-icon-off")
        const soundOn = ControlsBar.getElementById("sound-icon-on")

        if(isAudioAllowed) {
            soundOn.style.display = "block"
            soundOff.style.display = "none";
        } else {
            soundOn.style.display = "none"
            soundOff.style.display = "block";
        }
    }

    private setStartGameVisibility(started: boolean): void {
        const startGame = ControlsBar.getElementById("start-game-btn")
        const stopGame = ControlsBar.getElementById("stop-game-btn")

        if(!started) {
            startGame.style.display = "block"
            stopGame.style.display = "none";
        } else {
            startGame.style.display = "none"
            stopGame.style.display = "block";
        }
    }

    private setStartAutoGameVisibility(started: boolean): void {
        const startGame = ControlsBar.getElementById("start-auto-game-btn")
        const stopGame = ControlsBar.getElementById("stop-auto-game-btn")

        if(!started) {
            startGame.style.display = "block"
            stopGame.style.display = "none";
        } else {
            startGame.style.display = "none"
            stopGame.style.display = "block";
        }
    }

    private setCarEngineVisibility(val?: boolean): void {
        let engine: boolean

        if(val !== undefined) {
            engine = val
        } else {
            engine = this.car.getStopUpdate()
        }

        const play = ControlsBar.getElementById("icon-play")
        const stop = ControlsBar.getElementById("icon-stop")

        if(engine) {
            play.style.display = "block"
            stop.style.display = "none";
        } else {
            play.style.display = "none"
            stop.style.display = "block";
        }
    }

    private onClickStartHelicopter(): void {
        const helicopter = this.props.container.getUpdatable("helicopter") as Helicopter
        helicopter.setCamera()
        helicopter.startFlyForCar()
        this.car.stopCar()
        this.setCarEngineVisibility(true)
        this.hideAllButtonsInLeftBar()
    }

    private showAllButtonsInLeftBar(): void {
        document.querySelectorAll(".left-bar .btn").forEach(element => {
            element.classList.remove("disabled")
        })
    }

    private hideAllButtonsInLeftBar(): void {
        document.querySelectorAll(".left-bar .btn").forEach(element => {
            element.classList.add("disabled")
        })
    }

    private setGas(newFuel: number): void {
        ControlsBar.getElementById("car-gas-bar-inside").style.width = newFuel + "%"
    }

    private hideButtonsAfterStart(): void {
        const arr = [
            ControlsBar.getElementById("start-btn"),
            ControlsBar.getElementById("start-auto-btn"),
            ControlsBar.getElementById("edit-mode-btn"),
        ]

        arr.forEach(e => {
            e.classList.add("disabled")
        })
    }

    private showRunningButtons(): void {
        const buttons = document.querySelectorAll(".running-btn")

        buttons.forEach(button => {
            button.classList.remove("disabled")
        })
    }

    private getCar(): Car | undefined {
        try {
            return  this.props.container.getUpdatable("car") as Car
        } catch (err) {
            toastr.warning("Start (car) is missing.")
        }
    }

    private getTarget(): Target | undefined {
        try {
            return  this.props.container.getUpdatable("target") as Target
        } catch (err) {
            toastr.warning("Target is missing.")
        }
    }

    private setDisableForStreetCameraButtons(val: boolean): void {
        const buttons = document.querySelectorAll(".camera-display-btn");

        buttons.forEach(btn => {
            if(val) {
                btn.classList.add("disabled")
            } else {
                btn.classList.remove("disabled")
            }
        })
    }
}