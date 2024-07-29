import {Area} from "../fields/Area";
import {AreaComponent, GlobalProps, isBehaviourStop} from "../../type";
import {c} from "vite/dist/node/types.d-aGj9QkWt";

export class EditMode {
    private _active = false

    private _selectedArea?: Area

    constructor(
        private props: GlobalProps
    ) {}

    public setActive(val: boolean): void {
        this._active = val

        if(this.active) {
            this.props.world.areas.forEach(row => {
                row.forEach(area => {
                    area.unSelect()
                })
            })
        }
    }

    public selectArea(area: Area): void {
        if(this._selectedArea) {
            this._selectedArea.unSelect()
        }

        this._selectedArea = area
    }

    public get selectedArea(): Area | undefined {
        return this._selectedArea;
    }

    public get active(): boolean {
        return this._active;
    }

    public addComponent(componentType: string): void {
        if(!this.selectedArea) {
            // logger
            throw new Error("Not selected area.")
        }

        let cannotBeMultipleComponentsInArea = false

        this.selectedArea.areaProps.components.forEach((s) => {
            const c = s as unknown as AreaComponent

            if(c.canBeWithMultipleComponentsInArea) {
                if(!c.canBeWithMultipleComponentsInArea()) {
                    cannotBeMultipleComponentsInArea = true
                }
            }
        })

        if(cannotBeMultipleComponentsInArea) {
            return
        }

        this.props.world.createDynamically(componentType, this.selectedArea.areaProps, this.selectedArea.floorPlane)
    }

    public removeComponentsFromArea(): void {
        if(this.selectedArea) {
            this.selectedArea.removeComponents()
        }
    }
}