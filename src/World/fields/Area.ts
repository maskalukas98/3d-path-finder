import {Clock, Group, Mesh, MeshStandardMaterial, PlaneGeometry, Vector3} from "three";
import {Component, UpdatableComponent} from "../../component/Component";
import {GlobalProps} from "../../type";
import {Input} from "../../Input";
import {Cursor} from "../../util/Cursor";
import {Car} from "../../component/car/Car";
import {PathDetails} from "../../algorithm/pathFinder/PathDetails";

export type AreaProps = {
    type: string,
    rowId: number,
    boxId: number,
    position: Vector3,
    components: Component[],
}

export class Area extends UpdatableComponent {
    public static readonly size = 60
    public static readonly initialStartXZ = 27.9
    public static readonly color = 0x000000
    public static readonly hoverColor = 0x00FFFF
    public static readonly selectColor = 0xFFD700
    public static readonly roughness = 0.8
    public static readonly metalness = 0.2

    private static readonly shortestColor = 0x3CB371

    private selected = false
    public pathDetails = new PathDetails()

    protected entered = false

    constructor(
        protected props: GlobalProps,
        public floorPlane: Mesh<PlaneGeometry, MeshStandardMaterial>,
        public readonly areaProps: AreaProps,
    ) {
        super(
            Area.createAreaId(areaProps.rowId, areaProps.boxId),
            {
                children: {},
                animations: [],
                modelName: floorPlane.name,
                scene: floorPlane as unknown as Group
            },
            props
        );

        Input.registerMouseMoveComponent(this.model.modelName)
    }

    public onEnterArea(car: Car): boolean {
        if(!this.entered) {
            this.entered = true
            return true
        }

        return false
    }

    public static createAreaId(rowId: number, columnId: number): string {
        return rowId + "-" + columnId
    }

    public static getAreaIndex(objPosition: Vector3): { row: number, column: number } {
        return {
            row: Math.floor((objPosition.z - Area.initialStartXZ) / Area.size),
            column: Math.floor((objPosition.x + Area.initialStartXZ) / Area.size)
        };
    }

    public handleInput() {
        if(!this.props.editMode.active) {
            if(this.selected) {
                this.unSelect()
            }

            return
        }


        if(this.getSceneModel().userData.mouseover) {
            this.setHover()
            this.getSceneModel().userData.mouseover = false
        }

        if(this.getSceneModel().userData.mouseout) {
            this.resetHover()
            this.getSceneModel().userData.mouseout = false
        }

        if(this.getSceneModel().userData.clicked) {
            this.switchSelect()
            this.getSceneModel().userData.clicked = false
        }
    }

    destructor?(): void {
        throw new Error("Method not implemented.");
    }

    public update(clock: Clock, deltaTime: number) {
    }

    public setShortest(): void {
        this.floorPlane.material.color.setHex(Area.shortestColor)
    }

    public unSelect(): void {
        this.selected = false
        this.floorPlane.material.color.setHex(Area.color)
    }

    public addComponent(component: Component): void {
        this.areaProps.components.push(component)
    }

    public removeComponents(): void {
        this.areaProps.components.forEach(component => {
            this.props.container.remove(component)
        })

        this.areaProps.components.length = 0
    }

    private setHover(): void {
        Cursor.setPointerCursor()

        if(this.selected) {
            return
        }

        this.floorPlane.material.color.setHex(Area.hoverColor);
    }

    private resetHover(): void {
        Cursor.setAutoCursor()

        if(this.selected) {
            return
        }

        this.floorPlane.material.color.setHex(Area.color)
    }

    private switchSelect(): void {
        if(this.selected) {
            this.unSelect()
        } else {
            this.props.editMode.selectArea(this)
            this.selected = true
            this.floorPlane.material.color.setHex(Area.selectColor);
        }
    }

    isObstacle(): boolean {
        return this.areaProps.components.some(s => s.isObstacle())
    }
}