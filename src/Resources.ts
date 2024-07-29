import {Loader} from "./Loader";
import {
    EventDispatcher,
    EventType,
    LoadedAudioEvent,
    LoadedModelEvent,
    LoadedTextureEvent,
    ResourceData,
    ResourceType
} from "./Event";
import {LoadedAudio, LoadedFont, LoadedModel, LoadedTexture} from "./type";
import {House} from "./component/house/House";
import {Car} from "./component/car/Car";
import {Meteor} from "./component/meteor/Meteor";
import {Semaphore} from "./component/semaphore/Semaphore";
import {Field} from "./component/Field";
import {Dog} from "./component/animal/Dog";
import {Chicken} from "./component/animal/Chicken";
import {Helicopter} from "./component/helicopter/Helicopter";
import {Mesh} from "three";
import {StreetCamera} from "./component/streetCamera/StreetCamera";
import {Font} from "three/examples/jsm/loaders/FontLoader";
import {GasStation} from "./component/gasStation/GasStation";
import {Buildings} from "./World/Buildings";
import {Howl} from "howler";
import {Audio} from "./Audio";
import {Target} from "./component/Target";
import {ControlsBar} from "./ControlsBar";

type ResourceExtension = "glb" | "ogg" | "mp3" | "fbx" | "texture" | "font"

type Resource = {
    modelName: string,
    type: ResourceExtension,
    id?: string
}

export class Resources {
    private readonly loader: Loader

    public toLoad!: number
    public currLoaded!: number

    private loadedResources= new Map<string, LoadedModel>()
    private loadedAudio = new Map<string, Howl>()
    private loadedTexture = new Map<string, LoadedTexture>()
    private loadedFonts = new Map<string, LoadedFont>()

    constructor(
        private event: EventDispatcher
    ) {
        this.loader = new Loader(this.event)

        // @ts-ignore
        this.event.addEventListener(EventType.RESOURCE_LOADED, (e: LoadedModelEvent | LoadedAudioEvent) => {
            this.updateApplicationIntoLoader()
            this.onLoadedResource(e.data, e.resourceType)
        })
    }

    // resources + resources in AUDIO!!
    private readonly list: Resource[] = [
        { modelName: House.modelName, type: "glb" },
        { modelName: Meteor.modelName, type: "glb" },
        { modelName: Car.modelName, type: "glb" },
        { modelName: Semaphore.modelName, type: "glb" },
        { modelName: Field.modelName, type: "glb" },
        { modelName: Dog.modelName, type: "glb" },
        { modelName: Chicken.modelName, type: "glb" },
        { modelName: Helicopter.modelName, type: "glb" },
        { modelName: StreetCamera.modelName, type: "glb" },
        { modelName: GasStation.modelName, type: "glb" },
        { modelName: Buildings.modelName, type: "glb" },
        { modelName: Target.modelName, type: "glb" },
        { modelName: "fence", type: "glb" },
        { modelName: "tree", type: "glb" },
        { modelName: "numbers", type: "texture" },
        { modelName: "helvetiker_regular.typeface", type: "font", id: "default" }

    ]

    public getClonedTexture(textureName: string): LoadedTexture["data"] {
        const model = this.loadedTexture.get(textureName)

        if(!model) {
            throw new Error("Texture " + textureName + " does not exist.")
        }

        return {
            mesh: model.data.mesh,
            materials: model.data.materials
        }
    }

    public getClonedModel(modelName: string, cloneMaterials: boolean = false): LoadedModel {
        const model = this.loadedResources.get(modelName)

        if(!model) {
            throw new Error("Model " + modelName + " does not exist.")
        }

        const clonedScene  = model.scene.clone(true)
        if(cloneMaterials) {
            this.cloneMaterials(clonedScene as unknown as Mesh)
        }

        return {
            ...model,
            scene: clonedScene,
        }
    }

    public getFont(fontId: string): Font {
        const font = this.loadedFonts.get(fontId)

        if(!font) {
            throw new Error("Font " + fontId + " does not exist.")
        }

        return font.font
    }

    public getModel(modelName: string): LoadedModel {
        const model = this.loadedResources.get(modelName)

        if(!model) {
            throw new Error("Model " + modelName + " does not exist.")
        }

        return {
            ...model,
            scene: model.scene,
        }
    }

    public load() {
        this.toLoad = this.list.length + Audio.resources.length
        this.currLoaded = 0

        for(const resource of this.list) {
            if(resource.type === "glb") {
                this.loader.loadGLTFL(resource.modelName)
            } else if (resource.type === "fbx") {
                this.loader.loadFBX(resource.modelName)
            } else if (resource.type === "ogg") {
                this.loader.loadAudio("car-drive", "ogg")
            } else if(resource.type === "font") {
                if(resource.id === undefined) {
                    throw new Error("Font must has id.")
                }

                this.loader.loadFont(resource.modelName, resource.id)
            }
        }

        this.loader.loadTextureNumbers()
    }

    private onLoadedResource(loadedModel: ResourceData, resourceType: ResourceType): void {
        if(resourceType === "model") {
            const resource = loadedModel as LoadedModel
            this.loadedResources.set(resource.modelName, resource)
        }  else if (resourceType === "texture") {
            const texture = loadedModel as LoadedTexture
            this.loadedTexture.set(texture.textureName, texture)
        } else if (resourceType === "font") {
            const loadedFont = loadedModel as unknown as LoadedFont
            this.loadedFonts.set(loadedFont.fontName, loadedFont)
        }

        this.increaseCurrentLoaded()
    }

    public increaseCurrentLoaded(): void {
        this.currLoaded++

        if(this.currLoaded === this.toLoad) {
            this.event.confirmLoadedAllResources()
        }
    }

    private cloneMaterials(object: Mesh): void {
        if (object.material) {
            if (Array.isArray(object.material)) {
                object.material = object.material.map(mat => mat.clone());
            } else {
                object.material = object.material.clone();
            }
        }
        if (object.children.length > 0) {
            object.children.forEach(child => this.cloneMaterials(child as Mesh));
        }
    }

    public updateApplicationIntoLoader(): void {
        const percentage = (this.currLoaded / this.toLoad) * 100;
        ControlsBar.getElementById("application-loader-bar-inside").style.width = percentage + "%"
        ControlsBar.getElementById("application-loader-num").textContent = Math.floor(percentage) + "%"

        if(percentage === 100) {
            setTimeout(() => {
                ControlsBar.getElementById("intro").classList.add("finished")
            }, 500)
        }
    }
}