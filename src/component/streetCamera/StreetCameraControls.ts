import {StreetCamera} from "./StreetCamera";
import {Clearable, GlobalProps} from "../../type";
import {Car} from "../car/Car";
import * as THREE from "three";
import {VideoRecording} from "./VideoRecording";
import {Analyzator} from "./Analyzator";
import {TrackLine} from "./TrackLine";
import {StreetCameraManager} from "./StreetCameraManager";
import {ControlsBar} from "../../ControlsBar";

// TODO: REWRITE TO REACT!!!!!!!!!

export class StreetCameraControls implements Clearable {
    private cameraIdElement: HTMLSpanElement
    private readonly car: Car
    private videoRecording!: VideoRecording
    private analyzator = new Analyzator()
    private trackLine: TrackLine | null = null

    private readonly recordSwitchHandler: () => void
    private readonly zoomPlusHandler: () => void
    private readonly zoomMinusHandler: () => void
    private readonly analyzatorStartHandler: () => void
    private readonly showTrackableLinesHandler: () => void

    constructor(
        private props: GlobalProps,
        private streetCamera: StreetCamera
    ) {
        // handlers
        this.recordSwitchHandler = this.recordSwitch.bind(this)
        this.zoomPlusHandler = this.zoomPlus.bind(this)
        this.zoomMinusHandler = this.zoomMinus.bind(this)
        this.analyzatorStartHandler = this.analyzator.start.bind(this.analyzator)
        this.showTrackableLinesHandler = this.showTrackableLines.bind(this)

        this.videoRecording = new VideoRecording(props.renderer.domElement)
        this.printCurrentZoom()

        this.cameraIdElement = document.getElementById("camera-id") as HTMLSpanElement;
        this.cameraIdElement.textContent = streetCamera.getId();

        this.car = props.container.getUpdatable("car") as Car
        ControlsBar.getElementById("camera-display-section").style.display = "flex"

        ControlsBar.getElementById("record-btn").addEventListener("click", this.recordSwitchHandler)
        ControlsBar.getElementById("zoom-plus").addEventListener("click", this.zoomPlusHandler)
        ControlsBar.getElementById("zoom-minus").addEventListener("click", this.zoomMinusHandler)
        ControlsBar.getElementById("analyze-btn").addEventListener("click", this.analyzatorStartHandler)
        ControlsBar.getElementById("show-trackable-points-btn").addEventListener("click", this.showTrackableLinesHandler)
    }

    public clear(): void {
        const currCameraManager = this.props.camera.currentCameraManager

        this.streetCamera.clear()
        this.streetCamera.switchToDefaultCamera()

        this.trackLine?.clear()
        this.trackLine = null
        this.videoRecording.clear()
        this.analyzator.clear()

        ControlsBar.getElementById("record-btn").removeEventListener("click", this.recordSwitchHandler)
        ControlsBar.getElementById("zoom-plus").removeEventListener("click", this.zoomPlusHandler)
        ControlsBar.getElementById("zoom-minus").removeEventListener("click", this.zoomMinusHandler)
        ControlsBar.getElementById("analyze-btn").removeEventListener("click", this.analyzatorStartHandler)
        ControlsBar.getElementById("show-trackable-points-btn").removeEventListener("click", this.showTrackableLinesHandler)
        ControlsBar.getElementById("camera-display-section").style.display = "none"
        ControlsBar.getElementById("analyze").style.display = "none"
    }

    public update(clock: THREE.Clock, deltaTime: number): void {
       if(this.trackLine) {
           this.trackLine.update(clock, deltaTime)
       }
    }

    private zoomPlus(): void {
        if(this.props.camera.getCamera().zoom > 20) {
            return
        }

        this.props.camera.getCamera().zoom += 1
        this.printCurrentZoom()
    }

    private zoomMinus(): void {
        if(this.props.camera.getCamera().zoom <= 1) {
            return
        }

        this.props.camera.getCamera().zoom -= 1
        this.printCurrentZoom()
    }
    private showTrackableLines(): void {
        if(!this.trackLine) {
            this.trackLine = new TrackLine(this.props, this.car)
            this.trackLine.showPoints()
            return
        }

        this.trackLine.destructive()
        this.trackLine = null
    }

    private recordSwitch(): void {
        this.videoRecording.recordingSwitch()
    }

    private printCurrentZoom(): void {
        ControlsBar.getElementById("current-zoom").textContent = String(this.props.camera.getCamera().zoom)
    }
}