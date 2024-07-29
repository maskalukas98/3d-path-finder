import {LoadedAudio, LoadedFont, LoadedModel, LoadedTexture} from "./type";

export enum EventType {
    RESOURCE_LOADED = "resource_loaded",
    ALL_LOADED = "all_loaded"
}

export type ResourceType = "model" | "texture" | "font"
export type ResourceData = LoadedModel | LoadedAudio | LoadedTexture

export class LoadedModelEvent extends Event {
    public readonly resourceType: ResourceType = "model"

    constructor(public data: LoadedModel) {
        super(EventType.RESOURCE_LOADED);
    }
}

export class LoadedAudioEvent extends Event {
    public readonly resourceType: ResourceType = "audio"

    constructor(public data: LoadedAudio) {
        super(EventType.RESOURCE_LOADED);
    }
}

export class LoadedTextureEvent extends Event {
    public readonly resourceType: ResourceType = "texture"

    constructor(public data: LoadedTexture) {
        super(EventType.RESOURCE_LOADED);
    }
}

export class LoadedFontEvent extends Event {
    public readonly resourceType: ResourceType = "font"

    constructor(public data: LoadedFont) {
        super(EventType.RESOURCE_LOADED);
    }
}

export class EventDispatcher extends EventTarget {
    public confirmLoadedModelResource(data: LoadedModel): void {
        this.dispatchEvent(new LoadedModelEvent(data))
    }

    public confirmLoadedAudioResource(data: LoadedAudio): void {
        this.dispatchEvent(new LoadedAudioEvent(data))
    }

    public confirmLoadedAllResources(): void {
        this.dispatchEvent(new Event(EventType.ALL_LOADED))
    }

    public confirmLoadedTextureResource(data: LoadedTexture): void {
        this.dispatchEvent(new LoadedTextureEvent(data))
    }

    public confirmLoadedFontResource(data: LoadedFont): void {
        this.dispatchEvent(new LoadedFontEvent(data))
    }
}