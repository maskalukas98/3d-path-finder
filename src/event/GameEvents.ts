import {StreetCamera} from "../component/streetCamera/StreetCamera";

export namespace GameEvents {
    export class Names {
        public static readonly Defeat = "game_defeat"
        public static readonly Restarted = "game_restarted"
        public static readonly Started = "game_started"
        public static readonly Stopped = "game_stopped"

        public static readonly EditModeActivated = "edit_mode_activated"
        public static readonly NormalModeActivated = "normal_mode_activated"
    }

    export class GameStarted extends Event {
        constructor(
            public readonly driveType: "manual" | "auto"
        ) {
            super(GameEvents.Names.Started);
        }
    }
}