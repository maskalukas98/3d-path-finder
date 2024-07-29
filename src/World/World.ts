// @ts-nocheck
import {GlobalProps} from "../type";
import {House} from "../component/house/House";
import {Car} from "../component/car/Car";
import {Semaphore} from "../component/semaphore/Semaphore";
import {Field} from "../component/Field";
import {Dog} from "../component/animal/Dog";
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils';
import {Chicken} from "../component/animal/Chicken";
import {Helicopter} from "../component/helicopter/Helicopter";
import {Position} from "../util/Position";
import {StreetCamera} from "../component/streetCamera/StreetCamera";
import {GasStation} from "../component/gasStation/GasStation";
import {Buildings} from "./Buildings";
import {Area, AreaProps} from "./fields/Area";
import * as THREE from "three";
import {BackSide, Group, Mesh, MeshStandardMaterial, PlaneGeometry, Vector3} from "three";
import {Target} from "../component/Target";
import {GasStationArea} from "./fields/GasStationArea";
import {SemaphoreArea} from "./fields/SemaphoreArea";
import {TargetArea} from "./fields/TargetArea";
import {ShortestPath} from "../algorithm/pathFinder/ShortestPath";
import {Euler} from "three/src/math/Euler";
import * as toastr from "toastr";
import 'toastr/build/toastr.min.css';
import {StreetCameraEvents} from "../component/streetCamera/StreetCameraEvents";
import {CarEvents} from "../component/car/CarEvents";

toastr.options.positionClass = "toast-bottom-center"

export class World {
    private static readonly areaGap = 60

    public ground: { type: string }[][] = [
        [{ type: "house" }, { type: "none" }, { type: "car"}, { type: "none" }, { type: "field" }, { type: "none"}, {type: "none"}, {type: "none"}],
        [{ type: "none" }, { type: "none" }, { type: "field" }, { type: "streetCamera" }, { type: "none"}, { type: "none"}, {type: "none"}, {type: "none"}],
        [{ type: "field" }, { type: "field" }, { type: "none"}, { type: "none"}, { type: "field" }, { type: "none"}, {type: "field"}, {type: "none"}],
        [{ type: "none" }, { type: "none" }, { type: "house"}, { type: "field" }, { type: "none"}, { type: "none"}, {type: "house"}, {type: "semaphore"}],
        [{ type: "none" }, { type: "none" }, { type: "none"}, { type: "none"}, { type: "gasStation"}, { type: "none"}, {type: "none"}, {type: "none"}],
        [{ type: "none" }, { type: "none" }, { type: "streetCamera"}, { type: "none"}, { type: "none"}, { type: "none"}, {type: "field"}, {type: "none"}],
        [{ type: "none" }, { type: "none" }, { type: "field"}, { type: "none"}, { type: "semaphore"}, { type: "house"}, {type: "none"}, {type: "none"}],
        [{ type: "none" }, { type: "none" }, { type: "none"}, { type: "none"}, { type: "none"}, { type: "none"}, {type: "semaphore"}, {type: "none"}],
        [{ type: "none" }, { type: "none" }, { type: "target"}, { type: "house"}, { type: "none"}, { type: "none"}, {type: "none"}, {type: "none"}],
    ]

    /*
      public ground: { type: string }[][] = [
        [{ type: "house" }, { type: "none" }, { type: "none"}, { type: "none" }, { type: "field" }, { type: "none"}, {type: "none"}, {type: "none"}],
        [{ type: "none" }, { type: "none" }, { type: "field" }, { type: "streetCamera" }, { type: "car"}, { type: "none"}, {type: "none"}, {type: "none"}],
        [{ type: "field" }, { type: "field" }, { type: "none"}, { type: "none"}, { type: "field" }, { type: "none"}, {type: "field"}, {type: "none"}],
        [{ type: "none" }, { type: "none" }, { type: "house"}, { type: "field" }, { type: "none"}, { type: "none"}, {type: "house"}, {type: "semaphore"}],
        [{ type: "none" }, { type: "none" }, { type: "none"}, { type: "none"}, { type: "gasStation"}, { type: "none"}, {type: "none"}, {type: "none"}],
        [{ type: "none" }, { type: "none" }, { type: "streetCamera"}, { type: "none"}, { type: "none"}, { type: "none"}, {type: "field"}, {type: "none"}],
        [{ type: "none" }, { type: "none" }, { type: "field"}, { type: "field"}, { type: "semaphore"}, { type: "house"}, {type: "none"}, {type: "none"}],
        [{ type: "none" }, { type: "none" }, { type: "none"}, { type: "none"}, { type: "none"}, { type: "none"}, {type: "semaphore"}, {type: "none"}],
        [{ type: "none" }, { type: "none" }, { type: "target"}, { type: "house"}, { type: "none"}, { type: "none"}, {type: "none"}, {type: "none"}],
    ]

     */

    private static readonly maxNumberOfCars = 1

    public numberOfCameras = 0
    public numberOfTargets = 0

    public readonly _areas: Area[][] = []

    constructor(
        private props: GlobalProps
    ) {}

    public get areas(): Area[][] {
        return this._areas
    }

    public reset(): void {
        this.numberOfCameras = 0
        this._areas.length = 0
        this.createWorld()
    }

    public getArea(objPosition: Vector3): Area | undefined {
        const { row, column } = Area.getAreaIndex(objPosition)

        if(row < 0 || column < 0) {
            return undefined
        }

        if(row > this._areas.length - 1) {
            return undefined
        }

        if(column > this._areas[row].length - 1) {
            return undefined
        }

        return this._areas[row][column]
    }

    public createWorld() {
       // this.createCar(141, -25)
        this.createBuildings()
        this.createHelicopter(27, -30)
        this.createObjects()
        this.createObjectsAroundMap()

        this.props.eventEmitter.dispatchEvent(new Event("world_created"))
    }

    private createAreaRows(ground: string[][]): void {
        for(let i = 0; i < ground.length; i++) {
            this.areas[i] = []
        }
    }

    private createObjects(): void {
        this.createAreaRows(this.ground)

        let z = 0
        for(let rowIdx = 0; rowIdx < this.ground.length; rowIdx++) {
            let x = 0
            z += World.areaGap

            for(let boxIdx = 0; boxIdx < this.ground[rowIdx].length; boxIdx++) {
                const pos = new Vector3(x, 0, z)
                const box = this.ground[rowIdx][boxIdx]
                const areaProps = {
                    position: pos,
                    type: box.type,
                    components: [],
                    rowId: rowIdx,
                    boxId: boxIdx
                }

                const floor = this.createAreaFloor(areaProps)
                this.createDynamically(box.type, areaProps, floor as Mesh<PlaneGeometry, MeshStandardMaterial>)

                x +=  World.areaGap
            }
        }
    }

    public createObjectsAroundMap(): void {
        for(let i = 0; i < this.areas.length; i++) {
            let oppositeSideArea = this.areas[i][this.areas[i].length - 1]

            for(let x = 0; x < 3; x++) {
                let gap = x * 20

                this.createFence(
                    this.areas[i][0].areaProps.position.x - 30,
                    this.areas[i][0].areaProps.position.z - 20 + gap
                )

                this.createFence(
                    oppositeSideArea.areaProps.position.x + 30,
                    oppositeSideArea.areaProps.position.z - 20 + gap
                )
            }
        }

        for(let i = 0; i < this.areas[0].length; i++) {
            const oppositeArea = this.areas[this.areas.length - 1][i].areaProps

            for(let x = 0; x < 3; x++) {
                let gap = x * 20

                this.createFence(
                    this.areas[0][i].areaProps.position.x - 21.5 + gap,
                    this.areas[0][i].areaProps.position.z - 28,
                    new Euler(0,Math.PI / 2,0)
                )
                this.createFence(
                    oppositeArea.position.x - 21.5 + gap,
                    oppositeArea.position.z + 29,
                    new Euler(0,Math.PI / 2,0)
                )
            }
        }
    }

    private createFence(x: number, z: number, rotation?: Euler): void {
        const tree = this.props.resource.getClonedModel("fence")

        tree.scene.position.x = x
        tree.scene.position.z = z
        tree.scene.position.y = 0
        tree.scene.scale.setScalar(6)
        tree.scene.visible = true
        tree.scene.updateMatrixWorld(true);

        if(rotation) {
            tree.scene.rotation.x = rotation.x
            tree.scene.rotation.y = rotation.y
            tree.scene.rotation.z = rotation.z
        }

        this.props.scene.add(tree.scene)
        this.props.container.addStaticObject(tree.scene)
    }

    public createAreaFloor(areaProps: AreaProps): Mesh {
        const geometry = new THREE.PlaneGeometry(Area.size, Area.size);
        const material = new THREE.MeshStandardMaterial( {
            color: Area.color,
            side: BackSide,
            roughness: Area.roughness,
            metalness: Area.metalness
        });

        const floor = new THREE.Mesh( geometry, material );
        floor.receiveShadow = true;
        floor.castShadow = true;
        floor.rotation.x = Math.PI / 2
        floor.position.set(areaProps.position.x,0, areaProps.position.z)
        floor.name = "floor"
        floor.layers.set(1)

        return floor
    }

    private createBuildings(): void {
        const loadedModel = this.props.resource.getClonedModel(Buildings.modelName)

        loadedModel.scene.position.x = 25
        loadedModel.scene.position.z = -30
        loadedModel.scene.position.y = -3
        loadedModel.scene.scale.setScalar(6)
        loadedModel.scene.visible = true
        loadedModel.scene.updateMatrixWorld(true);

        const buildings = new Buildings(this.props, loadedModel, "buildings")
        this.props.container.add(buildings, loadedModel.scene)
    }

    private createTarget(x: number, z: number): Target {
        if(Target.maxCreatedInstances === this.numberOfTargets) {
            toastr.warning("Max " + Target.maxCreatedInstances + " target is allowed." )
            return
        }

        const loadedModel = this.props.resource.getClonedModel(Target.modelName)

        loadedModel.scene.position.x = x
        loadedModel.scene.position.z = z
        loadedModel.scene.position.y = -1
        loadedModel.scene.scale.setScalar(13)
        loadedModel.scene.visible = true
        loadedModel.scene.updateMatrixWorld(true);

        const target = new Target(this.props, loadedModel, "target")
        this.props.container.add(target, loadedModel.scene)
        this.numberOfTargets++

        return target
    }

    private createGasStation(x: number, z: number): GasStation {
        const loadedModel = this.props.resource.getClonedModel(GasStation.modelName, true)

        loadedModel.scene.position.x = x
        loadedModel.scene.position.z = z
        loadedModel.scene.position.y = -1
        loadedModel.scene.scale.setScalar(13)
        loadedModel.scene.visible = true
        loadedModel.scene.updateMatrixWorld(true);

        const gasStation = new GasStation(this.props, loadedModel, "gas")
        this.props.container.add(gasStation, loadedModel.scene)

        return gasStation
    }

    private createHouse(x: number, z: number): House {
        const loadedModel = this.props.resource.getClonedModel(House.modelName, true)
        const house = new House(this.props, loadedModel, "house")

        loadedModel.scene.position.x = x
        loadedModel.scene.position.z = z
        loadedModel.scene.position.y = 9
        loadedModel.scene.scale.set(6.5, 4, 6.5)
        loadedModel.scene.visible = true
        loadedModel.scene.updateMatrixWorld(true);

        this.props.container.add(house, loadedModel.scene)

        return house
    }

    private createField(x: number, z: number): Field {
        const loadedModel = this.props.resource.getClonedModel(Field.modelName)
        const field = new Field(this.props, loadedModel, "field")

        loadedModel.scene.position.x = x
        loadedModel.scene.position.z = z
        loadedModel.scene.position.y = 0
        loadedModel.scene.scale.setScalar(6.5)
        loadedModel.scene.visible = true
        loadedModel.scene.updateMatrixWorld(true);

        this.props.container.add(field, loadedModel.scene)

        return field
    }

    private createCar(x: number, z: number): Car {
        const alreadyCreatedCar = this.props.container.getUpdatableComponents().find(s => s instanceof Car)

        if(alreadyCreatedCar) {
            this.props.eventEmitter.dispatchEvent(new Event("car_removed"))
            this.props.container.remove(alreadyCreatedCar)
        }

        let loadedModel = this.props.resource.getModel(Car.modelName)
        loadedModel.scene = SkeletonUtils.clone(loadedModel.scene)
        loadedModel.scene.position.x = x
        loadedModel.scene.position.z = z
        loadedModel.scene.position.y = Position.floorY
        loadedModel.scene.rotation.y = -1.55
        loadedModel.scene.scale.setScalar(4)
        loadedModel.scene.updateMatrixWorld(true);


        const car = new Car(this.props, loadedModel, "car")
        this.props.container.addUpdatableComponent(car, loadedModel.scene)
        this.props.eventEmitter.dispatchEvent(new Event(CarEvents.Names.Created))
        return car
    }

    private createHelicopter(x: number, z: number): void {
        const loadedModel = this.props.resource.getClonedModel(Helicopter.modelName)
        loadedModel.scene.position.x = x
        loadedModel.scene.position.z = z
        loadedModel.scene.position.y = 13
        loadedModel.scene.rotation.y = 0
        loadedModel.scene.scale.setScalar(4)
        loadedModel.scene.updateMatrixWorld(true);


        const helicopter = new Helicopter(this.props, loadedModel, "helicopter")

        this.props.container.addUpdatableComponent(helicopter, loadedModel.scene)
    }

    private createDog(x: number, z: number): Dog {
        const loadedModel = this.props.resource.getModel(Dog.modelName)
        const clonedModel =  SkeletonUtils.clone(loadedModel.scene)
        loadedModel.scene = clonedModel
        clonedModel.position.x = x
        clonedModel.position.z = z
        clonedModel.position.y = 0
        clonedModel.rotation.y = 0
        clonedModel.scale.setScalar(8)
        clonedModel.visible = true

        const dog = new Dog(this.props, loadedModel, "dog", { x, z })

        this.props.container.addUpdatableComponent(dog, clonedModel)

        return dog
    }

    private createChicken(x: number, z: number): Chicken {
        const loadedModel = this.props.resource.getModel(Chicken.modelName)
        const clonedModel =  SkeletonUtils.clone(loadedModel.scene)
        loadedModel.scene = clonedModel
        clonedModel.position.x = x
        clonedModel.position.z = z
        clonedModel.position.y = 0
        clonedModel.rotation.y = 0
        clonedModel.scale.setScalar(8)
        clonedModel.visible = true

        const chicken = new Chicken(this.props, loadedModel, "chicken", { x, z })

        this.props.container.addUpdatableComponent(chicken, clonedModel)

        return chicken
    }

    public createSemaphore(x: number, z: number): Semaphore {
        const loadedModel = this.props.resource.getClonedModel(Semaphore.modelName)
        const semaphore = new Semaphore(this.props, loadedModel, "semaphore")

        loadedModel.scene.position.x = x - 23
        loadedModel.scene.position.z = z - 23
        loadedModel.scene.position.y = 0
        loadedModel.scene.rotation.y = -2.3

        this.props.container.addUpdatableComponent(semaphore, loadedModel.scene)

        return semaphore
    }

    public createStreetCamera(x: number, z: number): StreetCamera | undefined {
        if(StreetCamera.maxNumberOfCameras === this.numberOfCameras) {
            toastr.warning("Max " + StreetCamera.maxNumberOfCameras + " street cameras is allowed." )
            return
        }

        const loadedModel = this.props.resource.getClonedModel(StreetCamera.modelName)
        const camera = new StreetCamera(this.props, loadedModel, "cam-" + this.numberOfCameras)

        loadedModel.scene.position.x = x - 23
        loadedModel.scene.position.z = z - 23
        loadedModel.scene.position.y = 0
        loadedModel.scene.rotation.y = -2.3
        //loadedModel.scene.scale.setScalar(4)

        this.props.container.addUpdatableComponent(camera, loadedModel.scene)
        this.numberOfCameras++
        this.props.eventEmitter.dispatchEvent(new StreetCameraEvents.CreatedEvent(camera))

        return camera
    }


    public createDynamically(componentType: string, areaProps: AreaProps, floor: Mesh<PlaneGeometry, MeshStandardMaterial>): void {
        let area: Area | undefined

        switch (componentType) {
            case "house": {
                const house = this.createHouse(areaProps.position.x, areaProps.position.z)
                area = new Area(this.props, floor, areaProps)
                area.addComponent(house)
                break
            }
            case "field": {
                const field = this.createField(areaProps.position.x, areaProps.position.z)
                area = new Area(this.props, floor, areaProps)

                const randomFactor = Math.floor(Math.random() * 10);

                if(randomFactor > 4 && randomFactor < 7) {
                    const dog = this.createDog(areaProps.position.x, areaProps.position.z)
                    area.addComponent(dog)
                } else if(randomFactor > 7 && randomFactor <= 10) {
                    const chicken = this.createChicken(areaProps.position.x, areaProps.position.z)
                    area.addComponent(chicken)
                }

                area.addComponent(field)
                break
            }
            case "car": {
                const car = this.createCar(areaProps.position.x, areaProps.position.z)
                area = new Area(this.props, floor, areaProps)
                area.addComponent(car)
                break
            }
            case "semaphore": {
                const semaphore = this.createSemaphore(areaProps.position.x, areaProps.position.z)
                area = new SemaphoreArea(this.props, floor, areaProps, semaphore)
                area.addComponent(semaphore)
                break
            }
            case "streetCamera": {
                const streetCamera = this.createStreetCamera(areaProps.position.x, areaProps.position.z)
                area = new Area(this.props, floor, areaProps)

                if(streetCamera) {
                    area.addComponent(streetCamera)
                }

                break
            }
            case "gasStation": {
                const gasStation = this.createGasStation(areaProps.position.x, areaProps.position.z)
                area = new GasStationArea(this.props, floor, areaProps, gasStation)
                area.addComponent(gasStation)
                break
            }
            case "target": {
                const target = this.createTarget(areaProps.position.x, areaProps.position.z)
                area = new TargetArea(this.props, floor, areaProps, target)
                area.addComponent(target)
                break
            }
            default: {
                area = new Area(this.props, floor, areaProps)
            }
        }

        if(area) {
            this._areas[areaProps.rowId][areaProps.boxId] = area
            this.props.container.addUpdatableComponent(area, floor as unknown as Group)
        }
    }

    public getStartArea(): Area | undefined {
        const car = this.props.container.getUpdatableComponents().find(s => s instanceof Car)


        if(!car) {
            // logger
            return
        }

       return this.props.world.getArea(car.getSceneModel().position)
    }

    public getTargetArea(): Area | undefined {
        const target = this.props.container.getUpdatableComponents().find(s => s instanceof Target)


        if(!target) {
            // logger
            return
        }

        return this.props.world.getArea(target.getSceneModel().position)
    }

    public markShortestPath(shortestPathList: Area[]): void {
        const shortestPath = new ShortestPath(this.props, shortestPathList)

        this.props.container.addUpdatableLogic(shortestPath)
    }
}