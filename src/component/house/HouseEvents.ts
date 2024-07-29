import {UpdatableComponent} from "../Component";

export namespace HouseEvents {
    export class Names {
        public static readonly ViewStarted = "house_view_started"
    }

    export class ViewEvent extends Event {
        constructor(
            public readonly targetObject: UpdatableComponent
        ) {
            super(HouseEvents.Names.ViewStarted)
        }
    }
}