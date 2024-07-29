import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {GlobalProps} from "./type";
import {Mesh, Vector3} from "three";
import {StreetCamera} from "./component/streetCamera/StreetCamera";
import {c} from "vite/dist/node/types.d-aGj9QkWt";
import {Quaternion} from "three/src/math/Quaternion";
import {Euler} from "three/src/math/Euler";
import {Car} from "./component/car/Car";

type Props = {
    renderer: THREE.WebGLRenderer;
}

export interface CameraManager  {
    update(): void
    clear?(): void
    canBeOverTaken(): boolean
    onStart?(): void
}

class CameraIdle implements CameraManager {
    update() {}

    canBeOverTaken(): boolean {
        return true
    }

    onStart() {}

    clear() {}
}

export class CameraNormalManager implements CameraManager {
    private camera: THREE.PerspectiveCamera;
    private controls: OrbitControls

    constructor(
        private props: GlobalProps
    ) {
        this.camera = props.camera.getCamera()
        this.controls = props.camera.controls
    }

    update() {

    }

    onStart() {
        this.camera.position.z = -200;
        this.camera.position.y = 250
        this.camera.position.x = 120

        this.controls.enablePan = true;
        this.controls.minDistance = 0;
        this.controls.maxDistance = 200;
        this.controls.minPolarAngle = -10;
        this.controls.maxPolarAngle = 1.5;
        this.controls.autoRotate = false;
        this.controls.enableRotate = true
        this.controls.target = new THREE.Vector3(120, 0, 100);
        this.controls.update();
    }

    set(): void {
        this.props.camera.setCameraManager(new CameraIdle())
        this.update()
    }

    canBeOverTaken(): boolean {
        return true;
    }

    clear(): void {
    }
}

export class Camera {
    private fov = 100
    private aspect = window.innerWidth / window.innerHeight
    private near = 0.1
    private far = 1000

    private previousCameraManager?: CameraManager

    public camera!: THREE.PerspectiveCamera
    public controls!: OrbitControls

    public currentCameraManager: CameraManager = new CameraIdle()

    constructor(
        private props: GlobalProps
    ) {
        this.setCamera()
    }

    public clear(): void {
        this.camera.removeFromParent()
        this.controls.reset()
    }

    public setCamera(): void {
        this.camera =  new THREE.PerspectiveCamera(
            this.fov,
            this.aspect,
            this.near,
            this.far
        );
        this.camera.layers.enable(1)

        this.camera.position.z = 20;
        this.camera.position.y = 20
        this.camera.position.x = 60

        this.controls = new OrbitControls(this.camera, this.props.renderer.domElement);
        this.controls.enableDamping = false;
        this.controls.enablePan = true;
        this.controls.minDistance = 0;
        this.controls.maxDistance = 400;
        this.controls.minPolarAngle = 0;
        this.controls.maxPolarAngle = 20;
        this.controls.autoRotate = false;
        this.controls.enableRotate = true
        this.controls.target = new THREE.Vector3(20, 30, 100);
        this.controls.update();
    }

    public update(): void {
        this.currentCameraManager.update()
    }

    public lookAtHelper(targetPosition: Vector3): void {
        this.getCamera().lookAt(targetPosition)
        this.controls.target.copy(targetPosition)

        targetPosition = targetPosition.clone()
        targetPosition.y += 70
        targetPosition.z += 20
        targetPosition.x += -50

        const camPos = targetPosition.clone()
        camPos.z += 20
        camPos.x -= 40
        this.getCamera().zoom = 3

        targetPosition.z -= 200
        this.getCamera().position.copy(camPos)
        this.getCamera().updateProjectionMatrix()
        this.controls.update()
    }

    public getCamera(): THREE.PerspectiveCamera {
        return this.camera
    }

    public setCarDriverView(carPosition: Vector3, carRotation: Euler): void {
        const height = 1
        const offset = -2
        const carRotationCos = Math.cos(-carRotation.y)
        const carRotationSin = Math.sin(-carRotation.y)

        const cameraPosition = new Vector3(
            carPosition.x + carRotationCos * offset,
            carPosition.y + height + 2,
            carPosition.z + carRotationSin * offset
        );

        this.camera.position.copy(cameraPosition);

        const lookAt = new Vector3(
            carPosition.x + carRotationCos,
            carPosition.y + 2,
            carPosition.z + carRotationSin
        );

        this.camera.zoom = 0
        this.camera.lookAt(lookAt);
        this.controls.target = lookAt.clone()
        this.controls.update()
    }

    public setCameraManager(manager: CameraManager): void {
        this.previousCameraManager = this.currentCameraManager
        this.currentCameraManager = manager

        if(this.currentCameraManager.onStart) {
            this.currentCameraManager.onStart()
        }
    }

    public returnPreviousCameraManager(): void {
        if(this.currentCameraManager && !this.currentCameraManager.canBeOverTaken()) {
            return
        }

        if(this.previousCameraManager) {
            this.currentCameraManager = this.previousCameraManager
        } else {
            this.currentCameraManager = new CameraIdle()
        }
    }
}