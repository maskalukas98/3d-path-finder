import {Light} from "./Semaphore";

export namespace SemaphoreEvents {
    export class Names {
        public static readonly LightChanged = "light_changed";
    }

    export class LightChangedEvent extends Event {
        constructor(
            public readonly light: Light
        ) {
            super(SemaphoreEvents.Names.LightChanged);
        }
    }
}