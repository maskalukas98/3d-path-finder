import {Container} from "./Container";
import * as THREE from 'three';
import {Camera, CameraNormalManager} from "./Camera";
import {World} from "./World/World";
import {Resources} from "./Resources";
import {EventDispatcher, EventType} from "./Event";
import {Light} from "./Light";
import {Input} from "./Input";
import {Audio} from "./Audio";
import {GlobalProps} from "./type";
import {ControlsBar} from "./ControlsBar";
import {EditMode} from "./World/editMode/EditMode";
import {UpdatableComponent} from "./component/Component";
import {Area} from "./World/fields/Area";
import {AutoMove} from "./algorithm/pathFinder/AutoMove";
import {DijkstrasAlgorithm} from "./algorithm/pathFinder/DijkstrasAlgorithm";
import {WorldsEvents} from "./event/WorldEvents";
import {GameEvents} from "./event/GameEvents";
import {Car} from "./component/car/Car";
import * as toastr from "toastr";


export class Application {
    private input: Input
    public eventEmitter: EventDispatcher
    public  container: Container
    public camera: Camera
    public scene!: THREE.Scene;
    public renderer!: THREE.WebGLRenderer
    private resources: Resources
    private world: World
    private audio: Audio
    private clock = new THREE.Clock()
    private controlsBar!: ControlsBar
    private currentUpdatableComponents: UpdatableComponent[] = []
    private light: Light

    private globalProps: GlobalProps

    // handler
    private onWorldCreatedHandler: () => void
    private onEditModeActivatedHandler: () => void
    private onNormalModeActivatedHandler: () => void
    private onGameStartedHandler: (e: Event) => void
    private onGameStoppedHandler: () => void
    private onGameDefeatedHandler: () => void
    private onTargetEnteredHandler: () => void

    constructor() {
        this.onWorldCreatedHandler = this.onWorldCreated.bind(this)
        this.onEditModeActivatedHandler = this.onEditModeActivated.bind(this)
        this.onNormalModeActivatedHandler = this.onNormalModeActivated.bind(this)
        this.onGameStartedHandler = this.onGameStarted.bind(this)
        this.onGameStoppedHandler = this.onGameStopped.bind(this)
        this.onGameDefeatedHandler = this.onGameDefeated.bind(this)
        this.onTargetEnteredHandler = this.onTargetEntered.bind(this)

        ControlsBar.cloneGameUi()

        this.eventEmitter = new EventDispatcher()
        this.resources = new Resources(this.eventEmitter)

        this.setRenderer()

        this.container = new Container(this.scene)

        this.globalProps = {
            scene: this.scene,
            resource: this.resources,
            container: this.container,
            input: null as unknown as Input,
            camera: null as unknown as Camera,
            audio: null as unknown as Audio,
            world: null as unknown as World,
            renderer: this.renderer,
            eventEmitter: this.eventEmitter,
            controlsBar: null as unknown as ControlsBar,
            editMode: null as unknown as EditMode,
            started: false,
            app: this
        }

        this.controlsBar = new ControlsBar(this.globalProps)
        this.globalProps.controlsBar = this.controlsBar

        this.input = new Input(this.globalProps)
        this.globalProps.input = this.input

        this.camera = new Camera(this.globalProps)
        this.globalProps.camera = this.camera

        this.audio = new Audio(this.camera, this.resources)
        this.globalProps.audio = this.audio

        this.world = new World(this.globalProps)
        this.globalProps.world = this.world

        this.globalProps.editMode = new EditMode(this.globalProps)

        this.resources.load()

        this.light = new Light(this.globalProps)

        this.registerEventListeners(this.eventEmitter)

        this.eventEmitter.addEventListener(GameEvents.Names.Restarted, () => {
            this.onGameRestarted()
        })
    }

    public registerEventListeners(eventEmitter: EventDispatcher): void {
        eventEmitter.addEventListener(WorldsEvents.Names.worldCreated, this.onWorldCreatedHandler)
        eventEmitter.addEventListener(GameEvents.Names.EditModeActivated, this.onEditModeActivatedHandler)
        eventEmitter.addEventListener(GameEvents.Names.NormalModeActivated, this.onNormalModeActivatedHandler)
        eventEmitter.addEventListener(GameEvents.Names.Started, this.onGameStartedHandler)
        eventEmitter.addEventListener(GameEvents.Names.Stopped, this.onGameStoppedHandler)
        eventEmitter.addEventListener(GameEvents.Names.Defeat, this.onGameDefeatedHandler)
        eventEmitter.addEventListener("target_entered", this.onTargetEnteredHandler)
    }

    public unRegisterEventListeners(eventEmitter: EventDispatcher): void {
        eventEmitter.removeEventListener(WorldsEvents.Names.worldCreated, this.onWorldCreatedHandler)
        eventEmitter.removeEventListener(GameEvents.Names.EditModeActivated, this.onEditModeActivatedHandler)
        eventEmitter.removeEventListener(GameEvents.Names.NormalModeActivated, this.onNormalModeActivatedHandler)
        eventEmitter.removeEventListener(GameEvents.Names.Started, this.onGameStartedHandler)
        eventEmitter.removeEventListener(GameEvents.Names.Stopped, this.onGameStoppedHandler)
        eventEmitter.removeEventListener(GameEvents.Names.Defeat, this.onGameDefeatedHandler)
        eventEmitter.removeEventListener("target_entered", this.onTargetEnteredHandler)
    }

    public setRenderer() {
        this.scene = new THREE.Scene()

        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setClearColor(0x000000, 1)
        //this.renderer.setClearColor(0x87CEEB, 0.3) sky blue
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;

        document.body.appendChild( this.renderer.domElement );
    }

    public start(): void {
        this.eventEmitter.addEventListener(EventType.ALL_LOADED, () => {
            this.resources.updateApplicationIntoLoader()
            this.world.createWorld()
            this.animate()
        })
    }

    public stop(): void {
        this.currentUpdatableComponents.length = 0
        this.container.updatableLogics.length = 0
    }

    private animate(): void {
        requestAnimationFrame(this.animate.bind(this));

        const deltaTime = this.clock.getDelta();

        this.controlsBar.update(this.clock, deltaTime);

        for(const obj of this.container.updatableLogics) {
            obj.update(this.clock, deltaTime)
        }

        for(const obj of this.currentUpdatableComponents) {
            obj.handleInput()
            obj.update(this.clock, deltaTime)
        }

        this.camera.update()

        this.renderer.render(this.scene, this.camera.camera)
    }

    private onWorldCreated(): void {
        this.currentUpdatableComponents = this.container.getUpdatableComponents()
        this.camera.setCameraManager(new CameraNormalManager(this.globalProps))
        this.audio.play(Audio.GameMusic)
    }

    private onEditModeActivated(): void {
        new CameraNormalManager(this.globalProps).set()
        this.currentUpdatableComponents = this.container.getUpdatableComponents().filter(s => s instanceof Area)
    }

    private onNormalModeActivated(): void {
        if(this.camera.currentCameraManager && this.camera.currentCameraManager.canBeOverTaken()) {
            new CameraNormalManager(this.globalProps).set()
        }

        this.currentUpdatableComponents = this.container.getUpdatableComponents()
    }

    private onGameStarted(e: Event): void {
        this.globalProps.started = true
        const car = this.globalProps.container.getUpdatable("car") as Car
        const event = e as GameEvents.GameStarted

        const start = this.world.getStartArea()
        const target = this.world.getTargetArea()

        if(!start || !target) {
            // logger
            toastr.warning("You must select start (car position) and target!")
            return
        }
        const alg = new DijkstrasAlgorithm(this.world.areas, start, target)
        const shortestPathList = alg.searchAndMarkFastestPath()
        this.world.markShortestPath(shortestPathList)

        if(shortestPathList.length === 0) {
            this.eventEmitter.dispatchEvent(new Event(GameEvents.Names.Defeat))
            return;
        }

        if(event.driveType === "manual") {
            car.autoMove = false
            car.startCar()
        } else {
            car.autoMove = true
            this.container.addUpdatableLogic(new AutoMove(this.globalProps))
        }

        if(shortestPathList.length > 0) {
            this.eventEmitter.dispatchEvent(
                new Event(WorldsEvents.Names.ShortestPathFound)
            )
        }

        this.currentUpdatableComponents = this.container.getUpdatableComponents()
    }

    private onGameStopped(): void {
        this.globalProps.started = false
        this.currentUpdatableComponents = []
    }

    private onGameRestarted(): void {
        ControlsBar.refreshHtml()
        this.renderer.clear()
        this.currentUpdatableComponents.length = 0
        this.container.removeAll()
        this.light.clear()
        this.camera.clear()
        this.audio.clear()
        this.scene.removeFromParent()
        this.scene = new THREE.Scene()
        this.container = new Container(this.scene)

        this.unRegisterEventListeners(this.eventEmitter)
        this.eventEmitter = new EventDispatcher()
        this.registerEventListeners(this.eventEmitter)
        this.eventEmitter.addEventListener(GameEvents.Names.Restarted, () => {
            this.onGameRestarted()
        })

        this.globalProps = {
            scene: this.scene,
            resource: this.resources,
            container: this.container,
            input: null as unknown as Input,
            camera: null as unknown as Camera,
            audio: null as unknown as Audio,
            world: null as unknown as World,
            renderer: this.renderer,
            eventEmitter: this.eventEmitter,
            controlsBar: null as unknown as ControlsBar,
            editMode: null as unknown as EditMode,
            started: false,
            app: this
        }


        this.controlsBar = new ControlsBar(this.globalProps)
        this.globalProps.controlsBar = this.controlsBar

        this.input = new Input(this.globalProps)
        this.globalProps.input = this.input

        this.camera = new Camera(this.globalProps)
        this.globalProps.camera = this.camera

        this.audio = new Audio(this.camera, this.resources)
        this.globalProps.audio = this.audio

        this.world = new World(this.globalProps)
        this.globalProps.world = this.world

        this.globalProps.editMode = new EditMode(this.globalProps)

        this.light = new Light(this.globalProps)

        this.world.createWorld()
    }

    private onGameDefeated(): void {
        this.container.updatableLogics.length = 0
        this.currentUpdatableComponents = []
        this.audio.play(Audio.GameDefeat)
    }

    private onTargetEntered(): void {
        this.container.updatableLogics.length = 0
        this.currentUpdatableComponents.length = 0
        this.audio.play(Audio.GameVictory)
    }
}