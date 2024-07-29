export namespace WorldsEvents {
    export class Names {
        public static readonly worldCreated = "world_created"
        public static readonly ShortestPathFound = "shortest_path_found"
        public static readonly ShortestPathProcess = "shortest_path_current_process"
    }

    export class ShortestPathProcessEvent extends Event {
        constructor(
            public readonly currentTakenRoutes: number,
            public readonly totalRoutes: number
        ) {
            super(WorldsEvents.Names.ShortestPathProcess);
        }
    }
}