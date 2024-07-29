import * as THREE from "three";
import {GlobalProps, LoadedModel} from "../../type";
import {SpotLight} from "three";

export class CarLights {
    private static readonly angle = 0.3
    private static readonly distance = 100
    private static readonly penumbra = 0.1
    private static readonly intensity = 1000
    private static readonly color = 0xffffff

    private spotLight!: SpotLight;
    private target!: THREE.Object3D;

    constructor(
        private props: GlobalProps,
        private model: LoadedModel
    ) {
        this.setLight()
    }

    public turnOff(): void {
        this.spotLight.visible = false
    }

    public turnOn(): void {
        this.spotLight.visible = true
    }

    public switchVisible(): void {
        if(this.spotLight.visible) {
            this.turnOff()
        } else {
            this.turnOn()
        }
    }

    private setLight(): void {
        this.spotLight = new THREE.SpotLight(CarLights.color, CarLights.intensity);
        this.spotLight.position.set(2, -0.3, 0);
        this.spotLight.angle = CarLights.angle
        this.spotLight.distance = CarLights.distance;
        this.spotLight.penumbra = CarLights.penumbra;

        this.target = new THREE.Object3D();
        this.target.position.set(0, -10, 10);

        this.spotLight.target = this.target;
        this.model.scene.add(this.target);


        this.rotateSpotLight(0, Math.PI / 2,  this.spotLight, this.target);

        this.model.scene.add(this.spotLight);
    }

    private rotateSpotLight(angleX: number, angleY: number, light: SpotLight, target: THREE.Object3D): void {
        const distance = 10;
        const targetPosition = new THREE.Vector3();

        targetPosition.x = light.position.x + distance * Math.sin(angleY) * Math.cos(angleX);
        targetPosition.y = light.position.y + distance * Math.sin(angleX) - 2;
        targetPosition.z = light.position.z + distance * Math.cos(angleY) * Math.cos(angleX);

        target.position.copy(targetPosition);
    }
}