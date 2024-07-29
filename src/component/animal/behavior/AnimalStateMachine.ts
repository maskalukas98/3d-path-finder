import {IntervalChecker} from "../../../util/IntervalChecker";
import * as THREE from "three";
import {AnimalEvents} from "../AnimalEvents";


export enum AnimalState {
    Idle,
    Walk,
    Jump
}

export class AnimalStateMachine extends EventTarget {
    public static readonly behaviorEventType = "behaviorChange"

    private state = AnimalState.Idle
    private count = 0

    private counterMap: Record<number, number> = {}
    private intervalChecker = new IntervalChecker(2)

    constructor() {
        super();

        this.counterMap[AnimalState.Walk] = 2
        this.counterMap[AnimalState.Jump] = 1
    }

    public transition(newState: AnimalState): void {
        this.dispatchEvent(new AnimalEvents.BehaviorEvent(newState))
        this.state = newState
    }

    public update(clock: THREE.Clock) {
        this.makeRandomDecision(clock)
    }

    private makeRandomDecision(clock: THREE.Clock): void {
        if(this.intervalChecker.check(clock)) {
            const counter = this.counterMap[this.state]
            if(counter !== undefined && this.count < counter) {
                this.count++
                return
            }

            this.transition(
                Math.random() < 0.7 ? AnimalState.Walk : AnimalState.Jump
            )
            this.count = 0
        }
    }
}