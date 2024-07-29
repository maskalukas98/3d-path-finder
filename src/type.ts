import * as THREE from "three";
import {AnimationClip, Group, Mesh, MeshBasicMaterial, PlaneGeometry, Renderer} from "three";
import {Resources} from "./Resources";
import {Container} from "./Container";
import {Input} from "./Input";
import {Camera} from "./Camera";
import {Audio} from "./Audio";
import {World} from "./World/World";
import {EventType} from "./Event";
import {Font} from "three/examples/jsm/loaders/FontLoader";
import {ControlsBar} from "./ControlsBar";
import {EditMode} from "./World/editMode/EditMode";
import {Application} from "./Application";


export type GlobalProps = {
    scene: THREE.Scene,
    resource: Resources,
    container: Container,
    input: Input,
    camera: Camera,
    audio: Audio,
    world: World,
    renderer: Renderer,
    // global event emitter
    eventEmitter: EventTarget,
    controlsBar: ControlsBar,
    editMode: EditMode,
    started: boolean,
    app: Application
}

export type LoadedModel = {
    modelName: string,
    scene: Group,
    children: Record<string, Mesh>,
    animations: AnimationClip[]
}

export type LoadedAudio = {
    audioName: string
    buffer: AudioBuffer
}

export type LoadedTexture = {
    textureName: string,
    data: { mesh: Mesh, materials: MeshBasicMaterial[] }
}

export type LoadedFont = {
    fontName: string,
    font: Font
}

export interface Behaviour  {
    update(clock: THREE.Clock, deltaTime: number): void
}

export interface BehaviourStop  {
    destructor(): void
}


export const isBehaviourStop = (obj: any): obj is BehaviourStop => {
    return 'destructor' in obj && typeof obj.destructor === 'function';
};

export interface Clearable {
    clear(): void
}

export interface AreaComponent {
    canBeWithMultipleComponentsInArea(): boolean
}

export interface UpdatableLogic {
    getId(): string
    update(clock: THREE.Clock, deltaTime: number): void
}

export interface UnRegisterEvent {
    unRegisterEventListeners(): void
}