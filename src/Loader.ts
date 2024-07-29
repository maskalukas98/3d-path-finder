// @ts-nocheck
import {GLTF, GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {EventDispatcher} from "./Event";
import {Mesh, TextureLoader, Vector2} from "three";
import * as THREE from "three";
import {FBXLoader} from "three/examples/jsm/loaders/FBXLoader";
import {LoadedTexture} from "./type";
import {FontLoader} from "three/examples/jsm/loaders/FontLoader";



export class Loader {
    // TODO: move to env
    private static modelPath = "./static/model/"
    private static audioPath = "./static/audio/"
    private static imagePath = "./static/img/"
    private static fontPath = "./static/font/"

    private gltfLoader = new GLTFLoader()
    private fbxLoader = new FBXLoader()
    private audioLoader = new THREE.AudioLoader();
    private textureLoader = new TextureLoader()
    private fontLoader = new FontLoader()


    constructor(
        private event: EventDispatcher
    ) {}

    public loadFont(fontName: string, id: string): void {
        this.fontLoader.load(Loader.fontPath + fontName + ".json", font => {
            this.event.confirmLoadedFontResource({
                fontName: id,
                font
            })
        })
    }

    public loadGLTFL(modelName: string): void {
        this.gltfLoader.load(Loader.modelPath + modelName + ".glb", (data: GLTF) => {
            const scene = data.scene
            const children: Record<string, Mesh> = {}

            scene.traverse((child) => {
                if(child.isMesh) {
                    children[child.name] = child
                }
            })

            this.event.confirmLoadedModelResource({
                modelName,
                scene,
                children,
                animations: data.animations
            })
        }, () => {},
            (err) => {
            console.error("Error loading model: ", err)
        })
    }

    public loadFBX(modelName: string): void {
        this.fbxLoader.load(Loader.modelPath + modelName + ".fbx", (data) => {
                const scene = data
                const children: Record<string, Mesh> = {}

                scene.traverse((child) => {
                    if(child.isMesh) {
                        children[child.name] = child
                    }
                })

                this.event.confirmLoadedModelResource({
                    modelName,
                    scene,
                    children,
                    animations: data.animations
                })
            }, () => {},
            (err) => {
                console.error("Error loading model: ", err)
            })
    }

    public loadAudio(name: string, extension: string): void {
        this.audioLoader.load( Loader.audioPath + name + "." + extension, ( buffer ) => {
            this.event.confirmLoadedAudioResource({
                audioName: name,
                buffer
            })
        });
    }

    public loadTextureNumbers(): void {

        const mapper = {
            0: new Vector2(-0.015,0.5),
            1: new Vector2(0.22,0.5),
            2: new Vector2(0.38,0.5),
            3: new Vector2(0.57,0.5),
            4: new Vector2(0.77,0.5),
            5: new Vector2(-0.015,0),
            6: new Vector2(0.18,0),
        }


        this.textureLoader.load(Loader.imagePath + "numbers.png", (texture) => {
            const materials: THREE.MeshBasicMaterial[] = []

            Object.entries(mapper).forEach(([num, mapping], idx) => {
                const material = new THREE.MeshBasicMaterial({
                    map: texture.clone(),
                    transparent: false,
                    side: THREE.DoubleSide
                });

                material.map.offset.set(mapping.x, mapping.y);
                material.map.repeat.set(1, 1);

                materials.push(material)
            })

            const data: LoadedTexture = {
                textureName: "numbers",
                data: {
                    mesh: new Mesh(),
                    materials
                }
            }

            this.event.confirmLoadedTextureResource(data)
        })
    }
}