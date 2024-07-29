import {GlobalProps} from "./type";
import * as THREE from "three";

export class Light {
    private hemisphereLight: THREE.HemisphereLight;
    private directionalLight: THREE.DirectionalLight;


    constructor(
        private props: GlobalProps
    ) {
        this.hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x000000, 3);
        this.props.scene.add(this.hemisphereLight)

        this.directionalLight = new THREE.DirectionalLight(0xffffff, 5); // (color, intensity)
        this.directionalLight.position.set(0, 30, 0)
        this.directionalLight.castShadow = true;
        this.props.scene.add(this.directionalLight)
    }

    clear(): void {
        this.hemisphereLight.removeFromParent()
        this.directionalLight.removeFromParent()
    }
}