import {PointsMaterial, Vector3} from "three";
import {UpdatableComponent} from "../Component";
import * as THREE from "three";
import {Clearable, GlobalProps} from "../../type";
import {BufferGeometry} from "three/src/core/BufferGeometry";

export class TrackLine implements  Clearable {
    private static readonly maxPoints = 100
    private static size = 2
    private static readonly trackRange = 0.2

    private color = 0x059687
    private points: Vector3[] = []
    private elapsedTime = 0;
    private lastPointsMesh?: THREE.Points<BufferGeometry, PointsMaterial>

    constructor(
        private props: GlobalProps,
        private trackableComponent: UpdatableComponent
    ) {}

    public update(clock: THREE.Clock, deltaTime: number): void {
        this.elapsedTime += deltaTime

        if(this.elapsedTime >= TrackLine.trackRange) {
            this.points.push(this.trackableComponent.getSceneModel().position.clone())

            if (this.points.length > TrackLine.maxPoints) {
                this.points.shift();
            }

            this.showPoints()

            this.elapsedTime = 0
        }
    }

    public showPoints(): void {
        this.clear()

        const geometry = new THREE.BufferGeometry().setFromPoints(this.points);
        const material = new THREE.PointsMaterial({ color: this.color, size: TrackLine.size});
        this.lastPointsMesh = new THREE.Points(geometry, material);

        this.props.scene.add(this.lastPointsMesh);
    }

    public destructive(): void {
        this.clear()
    }

    public clear(): void {
        console.log("co", this.lastPointsMesh)
        if(this.lastPointsMesh) {
            this.lastPointsMesh.geometry.dispose()
            this.lastPointsMesh.material.dispose()
            this.lastPointsMesh.removeFromParent()
        }
    }
}