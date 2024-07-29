import {Area} from "../../World/fields/Area";
import {Queue} from "../../util/Queue";
import {Grid} from "../../util/Grid";
import {PathDetails} from "./PathDetails";

export class DijkstrasAlgorithm {
    private pathFounded = false
    private shortestPathList: Area[] = []
    private queue = new Queue<Area>()

    private markComplete = false
    private markCurrentArea: Area

    constructor(
        private areas: Area[][],
        private start: Area,
        private target: Area
    ) {
        this.queue.enqueue(this.start)
        this.markCurrentArea = target
    }

    public searchAndMarkFastestPath(): Area[] {

        while ((!this.queue.isEmpty()) && !this.pathFounded) {
            this.exploreNextNode()
        }

        if(this.pathFounded) {
            this.markShortestPath()
        }

        this.clear()
        return this.shortestPathList
    }

    private exploreNextNode(): void {
        const currentNode = this.queue.dequeue()

        if(!currentNode) {
            return
        }

        if(currentNode === this.target) {
            this.pathFounded = true
            return
        }

        currentNode.pathDetails.explored = true

        const neighbors = Grid.getAllNeighbors(
            currentNode.areaProps.rowId,
            currentNode.areaProps.boxId,
            this.areas
        )

        neighbors.forEach(neighbor => {
            if(!neighbor.pathDetails.explored && !neighbor.isObstacle()) {
                neighbor.pathDetails.explored = true
                neighbor.pathDetails.distance = currentNode.pathDetails.distance + 1
                this.queue.enqueue(neighbor)
            }
        })
    }

    private async markShortestPath(): Promise<void> {
        this.start.pathDetails.shortest = true
        this.target.pathDetails.shortest = true

        let i = 0
        while (!this.markComplete) {
            if(this.markSmallerNode()) {
                break
            }
        }

        if(this.pathFounded) {
            this.shortestPathList.unshift(this.target)
        }
    }

    private markSmallerNode(): boolean {
        const neighbors = Grid.getAllNeighbors(
            this.markCurrentArea.areaProps.rowId,
            this.markCurrentArea.areaProps.boxId,
            this.areas
        )

        let smallestWeightArea = this.markCurrentArea

        for(let i = 0; i < neighbors.length; i++) {
            const neighbor = neighbors[i]

            if(neighbor && neighbor.pathDetails.explored) {
                if(neighbor.pathDetails.distance < smallestWeightArea.pathDetails.distance) {
                    smallestWeightArea = neighbor
                }
            }
        }

        this.markCurrentArea = smallestWeightArea
        this.markCurrentArea.pathDetails.shortest = true
        this.shortestPathList.push(smallestWeightArea)

        if(this.markCurrentArea === this.start) {
            this.markComplete = true
            return true
        }

        return false
    }

    private clear(): void {
        this.areas.forEach(row => {
            row.forEach(area => {
                area.pathDetails = new PathDetails()
            })
        })
    }
}