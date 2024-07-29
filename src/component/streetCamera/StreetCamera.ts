import {Component, UpdatableComponent} from "../Component";
import {AreaComponent, GlobalProps, LoadedModel, UnRegisterEvent} from "../../type";
import {Clock, Group, LineBasicMaterial, LineSegments} from "three";
import * as THREE from "three";
import {StreetCameraManager} from "./StreetCameraManager";
import {BufferGeometry} from "three/src/core/BufferGeometry";
import {GameEvents} from "../../event/GameEvents";
import {CarEvents} from "../car/CarEvents";
import {Target} from "../Target";


export type StreetCameraParts = {
    camera: THREE.Group,
    cameraHolder: THREE.Group,
    cameraDisplay: THREE.Group,
    row: THREE.Group
}

export enum StreetCameraView {
    DefaultView,
    DisplayView
}

export class StreetCamera extends UpdatableComponent implements AreaComponent, UnRegisterEvent {
    public static modelName = "camera"
    public static readonly maxNumberOfCameras = 5

    public parts!: StreetCameraParts

    private _target!: Group
    private trackableLines!: LineSegments<BufferGeometry, LineBasicMaterial>
    private view = StreetCameraView.DefaultView

    // handlers
    private readonly onRestartedHandler: () => void
    private readonly onTrackCarHandler: () => void
    private readonly onCarRemovedHandler: () => void

    constructor(
        private props: GlobalProps,
        model: LoadedModel,
        id: string,
    ) {
        super(id, model, props);

        this.onRestartedHandler = this.onRestarted.bind(this)
        this.onTrackCarHandler = this.onTrackCar.bind(this)
        this.onCarRemovedHandler = this.onRestarted.bind(this)

        this.parts = {
            camera: model.scene.getObjectByName("camera") as THREE.Group,
            cameraHolder: model.scene.getObjectByName("camera-holder") as THREE.Group,
            cameraDisplay: model.scene.getObjectByName("camera-display") as THREE.Group,
            row: model.scene.getObjectByName("row") as THREE.Group,
        }

        this.registerEventListeners()

        const car = props.container.getUpdatable("car") as Target
        if(car) {
            this._target = car.getSceneModel()
        }

        const spriteMaterial = new THREE.SpriteMaterial({ color: 0xffffff });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.position.set(0, 20, 200);
        props.scene.add(sprite);
    }

    public updateTrackableLines(): void  {
        const carBoundingBox = new THREE.Box3().setFromObject(this.target);
        const carCenter = carBoundingBox.getCenter(new THREE.Vector3());

        this.trackableLines.position.copy(carCenter);

        const rotMatrix = new THREE.Matrix4();
        rotMatrix.lookAt(this.props.camera.getCamera().position, this.trackableLines.position, this.props.camera.getCamera().up);
        this.trackableLines.quaternion.setFromRotationMatrix(rotMatrix);
    }

    handleInput() {
    }

    update(clock: Clock, deltaTime: number) {
        if(this.view === StreetCameraView.DisplayView) {
            this.updateTrackableLines()
        } else {
            if(this.target) {
                this.updateCameraTargetView()
            }
        }
    }

    public clear(): void {
        this.clearTrackableLines()
    }

    destructor?(): void {
        throw new Error("Method not implemented.");
    }

    public canBeWithMultipleComponentsInArea(): boolean {
        return false
    }

    public remove(): void {
        super.remove()
        this.props.world.numberOfCameras--
    }

    public get target(): LoadedModel["scene"] {
        return this._target
    }

    public unRegisterEventListeners() {
        this.props.eventEmitter.removeEventListener(GameEvents.Names.Restarted, this.onRestartedHandler)
        this.props.eventEmitter.removeEventListener(CarEvents.Names.Created, this.onTrackCarHandler)
    }

    public switchToDefaultCamera(): void {
        this.view = StreetCameraView.DefaultView
        this.parts.cameraHolder.visible = true
        this.parts.camera.visible = true
        this.parts.cameraDisplay.visible = true
    }

    public switchToDisplayViewCamera(): void {
        this.view = StreetCameraView.DisplayView
        this.parts.cameraHolder.visible = false
        this.parts.camera.visible = false
        this.parts.cameraDisplay.visible = false

        this.addTrackableLines()
    }

    public clearTrackableLines(): void {
        if(this.trackableLines) {
            this.trackableLines.geometry.dispose()
            this.trackableLines.material.dispose()
            this.trackableLines.removeFromParent()
        }
    }

    private registerEventListeners(): void {
        this.props.eventEmitter.addEventListener(GameEvents.Names.Restarted, this.onRestartedHandler)
        this.props.eventEmitter.addEventListener(CarEvents.Names.Created, this.onTrackCarHandler)
        this.props.eventEmitter.addEventListener(CarEvents.Names.Removed, this.onCarRemovedHandler)
    }

    private updateCameraTargetView(): void {
        if(this.props.camera.currentCameraManager instanceof StreetCameraManager) {
            return
        }

        this.parts.camera.lookAt(this.target.position)
        this.parts.cameraHolder.lookAt(this.target.position)
        this.parts.cameraDisplay.lookAt(this.target.position)
    }

    private addTrackableLines(): void {
        const sideGeometry = new THREE.BufferGeometry();
        const vertices = new Float32Array([
            -15.0, -7.5, 15.0,   15.0, -7.5, 15.0,
            15.0, -7.5, 15.0,   15.0,  7.5, 15.0,
            15.0,  7.5, 15.0,  -15.0,  7.5, 15.0,
            -15.0,  7.5, 15.0,  -15.0, -7.5, 15.0
        ]);

        sideGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x059687, linewidth: 5 });

        const lineSegments = new THREE.LineSegments(sideGeometry, lineMaterial);
        lineSegments.position.copy(this.target.position);
        this.trackableLines = lineSegments
        this.props.scene.add(lineSegments);
    }

    private onTrackCar(): void  {
        const car = this.props.container.getUpdatable("car") as UpdatableComponent

        if(!car) {
            return
        }

        this._target = car.getSceneModel() as Group
        this.updateCameraTargetView()
    }

    isObstacle(): boolean {
        return false;
    }

    private onRestarted(): void {
        this._target = undefined as any
    }
}