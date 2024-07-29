import {CarHandBehaviour} from "./CarHandBehaviour";
import {CarPedalBehaviour} from "./CarPedalBehaviour";
import {GlobalProps, LoadedModel, UnRegisterEvent} from "../../type";
import {Car, CarMesh, CarParts} from "./Car";
import * as THREE from "three";
import {CarCameraManager, CarCameraViewType} from "./CarCameraManager";
import {CarEvents} from "./CarEvents";


export class CarDriverViewFacadeBehaviour implements UnRegisterEvent {
    private handBehaviour: CarHandBehaviour | null = null
    public readonly pedalBehaviour: CarPedalBehaviour | null = null

    // handlers
    private readonly turnLeftBlinkOnHandler: () => void
    private readonly turnRightBlinkOnHandler: () => void
    private readonly turnBlinksOffHandler: () => void
    private readonly turnGasSymbolOnHandler: () => void
    private readonly turnGasSymbolOffHandler: () => void

    constructor(
        private props: GlobalProps,
        private model: LoadedModel,
        private parts: CarParts,
        private mixer: THREE.AnimationMixer
    ) {
        this.turnLeftBlinkOnHandler = this.turnLeftBlinkOn.bind(this)
        this.turnRightBlinkOnHandler = this.turnRightBlinkOn.bind(this)
        this.turnBlinksOffHandler = this.turnBlinksOff.bind(this)
        this.turnGasSymbolOnHandler = this.turnGasSymbolOn.bind(this)
        this.turnGasSymbolOffHandler = this.turnGasSymbolOff.bind(this)

        this.pedalBehaviour = new CarPedalBehaviour(props, model, this.parts, this.mixer)

       this.registerEventListeners()
    }

    public update(clock: THREE.Clock, deltaTime: number): void {
        this.handBehaviour?.update(clock, deltaTime)
    }

    public showDriverLicence(): void {
        const currCameraManager = this.props.camera.currentCameraManager

        if(currCameraManager instanceof CarCameraManager) {
            if(currCameraManager.getView() !== CarCameraViewType.Driver) {
                return
            }

            if(this.handBehaviour) {
                this.handBehaviour.reset()
                this.handBehaviour = null
            } else {
                this.handBehaviour = new CarHandBehaviour(
                    this.props,
                    this.model,
                    this.parts,
                    this.mixer
                )
                this.handBehaviour.playAll()
            }
        }
    }

    public unRegisterEventListeners(): void {
        this.props.eventEmitter.removeEventListener(CarEvents.Names.blinkLeftOn, this.turnLeftBlinkOnHandler)
        this.props.eventEmitter.removeEventListener(CarEvents.Names.blinkRightOn, this.turnRightBlinkOnHandler)
        this.props.eventEmitter.removeEventListener(CarEvents.Names.blinkOff, this.turnBlinksOffHandler)
        this.props.eventEmitter.removeEventListener(CarEvents.Names.gasOn, this.turnGasSymbolOnHandler)
        this.props.eventEmitter.removeEventListener(CarEvents.Names.gasOff, this.turnGasSymbolOffHandler)
    }

    private turnGasSymbolOff(): void {
        const children = this.parts.gasSymbol.children as CarMesh[]
        const targetMesh = children.find(s => s.material.name === "gas-symbol")

        if(!targetMesh) {
            throw new Error("Gas symbol box mesh not found.")
        }

        const offColor = new THREE.Color(Car.dashboardSymbolDefaultColor);
        targetMesh.material.color.copy(offColor);
    }

    private turnGasSymbolOn(): void {
        const children = this.parts.gasSymbol.children as CarMesh[]
        const targetMesh = children.find(s => s.material.name === "gas-symbol")

        if(!targetMesh) {
            throw new Error("Gas symbol box mesh not found.")
        }

        targetMesh.material.color.set(0xFF3333)
    }

    private turnBlinksOff(): void {
        const offColor = new THREE.Color(Car.dashboardSymbolDefaultColor);
        this.parts.blinkLeft.material.color.copy(offColor);
        this.parts.blinkRight.material.color.copy(offColor);
    }

    private turnRightBlinkOn(): void {
        const lightGreen = new THREE.Color(0x7FFF00);
        this.parts.blinkRight.material.color.copy(lightGreen);
    }

    private turnLeftBlinkOn(): void {
        const lightGreen = new THREE.Color(0x7FFF00);
        this.parts.blinkLeft.material.color.copy(lightGreen);
    }

    private registerEventListeners(): void {
        this.props.eventEmitter.addEventListener(CarEvents.Names.blinkLeftOn, this.turnLeftBlinkOnHandler)
        this.props.eventEmitter.addEventListener(CarEvents.Names.blinkRightOn, this.turnRightBlinkOnHandler)
        this.props.eventEmitter.addEventListener(CarEvents.Names.blinkOff, this.turnBlinksOffHandler)
        this.props.eventEmitter.addEventListener(CarEvents.Names.gasOn, this.turnGasSymbolOnHandler)
        this.props.eventEmitter.addEventListener(CarEvents.Names.gasOff, this.turnGasSymbolOffHandler)
    }
}