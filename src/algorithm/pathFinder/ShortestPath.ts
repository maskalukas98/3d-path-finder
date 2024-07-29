import {Area} from "../../World/fields/Area";
import {GlobalProps, UpdatableLogic} from "../../type";
import {Clock} from "three";
import {WorldsEvents} from "../../event/WorldEvents";



export class ShortestPath implements UpdatableLogic {
    private static readonly interval = 0.1

    private elapsedTime = 0
    private currAreaIdx = 0
    private marked = false

    private alreadyTakenRoute = new Set<Area>()

    constructor(
        private props: GlobalProps,
        private path: Area[]
    ) {
        if(this.path.length === 0) {
            this.marked = true
        }

        this.currAreaIdx = this.path.length - 1
        this.alreadyTakenRoute.add(this.path[this.currAreaIdx])
        this.props.eventEmitter.dispatchEvent(
            new WorldsEvents.ShortestPathProcessEvent(1, this.path.length)
        )
    }

    public update(clock: Clock, deltaTime: number) {
        if(this.marked) {
            return
        }

        this.elapsedTime += deltaTime

        if(this.elapsedTime >= ShortestPath.interval) {
            this.path[this.currAreaIdx].setShortest()
            this.currAreaIdx--

            if(this.currAreaIdx < 0) {
                this.marked = true
            }

            this.elapsedTime = 0
        }
    }

    public getId(): string {
        return "shortest_path"
    }

    public getPath(): Area[] {
        return this.path
    }

    public markRouteAsTaken(area: Area): void {
        if(!this.path.includes(area)) {
            return
        }

        if(this.alreadyTakenRoute.has(area)) {
            return;
        }

        this.alreadyTakenRoute.add(area)
        this.props.eventEmitter.dispatchEvent(
            new WorldsEvents.ShortestPathProcessEvent(
                this.alreadyTakenRoute.size,
                this.path.length
            )
        )
    }
}