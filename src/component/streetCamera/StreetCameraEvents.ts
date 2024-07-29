import {StreetCamera} from "./StreetCamera";

export namespace StreetCameraEvents {
    export class Names {
        public static readonly DisplayViewStarted = "street_camera_display_view_started"
        public static readonly Removed = "street_camera_removed";
        public static readonly Created = "street_camera_created";
    }

    export class DisplayViewStartedEvent extends Event {
        constructor(
            public readonly streetCamera: StreetCamera
        ) {
            super(StreetCameraEvents.Names.DisplayViewStarted);
        }
    }

    export class RemovedEvent extends Event {
        constructor(
            public readonly cameraId: string
        ) {
            super(StreetCameraEvents.Names.Removed);
        }
    }

    export class CreatedEvent extends Event {
        constructor(
            public readonly streetCamera: StreetCamera
        ) {
            super(StreetCameraEvents.Names.Created);
        }
    }
}