import {GlobalProps, UpdatableLogic} from "../../type";
import {Cache, Clock, Group, Vector3} from "three";
import {Car} from "../../component/car/Car";
import {Area} from "../../World/fields/Area";
import {ShortestPath} from "./ShortestPath";
import {Position} from "../../util/Position";
import * as toastr from "toastr";



export class AutoMove implements UpdatableLogic {
    private readonly car!: Car
    private start!: Area
    private target!: Area
    private shortestPath: ShortestPath
    private currAreaIdx = 0
    private entered = false
    private turnFactor = 0

    constructor(
        private props: GlobalProps,
    ) {
        this.shortestPath = this.props.container.getUpdatableLogic("shortest_path")

        if(this.shortestPath) {
            this.currAreaIdx = this.shortestPath.getPath().length - 2

            if(this.currAreaIdx < 0) {
                throw new Error("Shortest path is missing.")
            }
        } else {
            throw new Error("Shortest path is missing.")
        }

        this.car = this.props.container.getUpdatable("car")
        const start = this.props.world.getStartArea()
        const target = this.props.world.getTargetArea()

        if(!this.car || !start || !target) {
            toastr.warning("Car, target or shortest path is missing!")
            return
        }

        this.start = start
        this.target = target
        this.car.startCar()

        const currPosition1 = this.shortestPath.getPath()[this.currAreaIdx + 1].areaProps.position
        const targetPosition1 = this.shortestPath.getPath()[this.currAreaIdx].areaProps.position
        const targetAngle = Position.getTargetAngle(currPosition1, targetPosition1) - 0.025

        this.car.getSceneModel().rotation.y += targetAngle + this.turnFactor
        this.turnFactor = -targetAngle
    }
    public update(clock: Clock, deltaTime: number) {
        this.move()
    }

    private move(): void {
        if(this.currAreaIdx < 0) {
            return
        }

        const targetPosition = this.shortestPath.getPath()[this.currAreaIdx].areaProps.position

        this.props.input.keyState.ArrowUp = true

        const distSq = Position.distanceSquared(
            this.car.getSceneModel().position.x,
            this.car.getSceneModel().position.z,
            targetPosition.x,
            targetPosition.z
        );

        if (distSq <= 2 && !this.entered) {
            if(this.currAreaIdx - 1 < 0) {
                return;
            }

            const currPosition1 = this.shortestPath.getPath()[this.currAreaIdx].areaProps.position
            const targetPosition1 = this.shortestPath.getPath()[this.currAreaIdx - 1].areaProps.position
            const targetAngle = Position.getTargetAngle(currPosition1, targetPosition1) - 0.025

            this.car.getSceneModel().rotation.y += targetAngle + this.turnFactor
            this.turnFactor = -targetAngle
            this.currAreaIdx--
            this.entered = true
            this.props.input.keyState.ArrowUp = false
            this.car.getSceneModel().position.x = targetPosition.x
            this.car.getSceneModel().position.z = targetPosition.z
        } else {
            this.entered = false
        }
    }

    getId(): string {
        return "auto_move";
    }
}
