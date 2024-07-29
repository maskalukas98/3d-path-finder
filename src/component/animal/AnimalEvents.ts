import {AnimalState} from "./behavior/AnimalStateMachine";

export namespace AnimalEvents {
    export class Names {
        public static readonly BehaviourChange = "behaviorChange"
    }

    export class BehaviorEvent extends Event {

        constructor(
            public readonly state: AnimalState
        ) {
            super(AnimalEvents.Names.BehaviourChange);
        }
    }
}