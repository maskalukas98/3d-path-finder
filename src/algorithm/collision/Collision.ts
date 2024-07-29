import {GlobalProps} from "../../type";
import {Car} from "../../component/car/Car";
import {Area} from "../../World/fields/Area";

export class Collision {
    private static readonly diff = 35

    private columnsNumber: number;
    private rowsNumber: number

    constructor(
        private props: GlobalProps,
        private car: Car
    ) {
        this.rowsNumber = props.world.areas.length * 60
        this.columnsNumber = (props.world.areas[0].length - 1) * 60
    }

    public detectMapBorder(): void {
        const carPos = this.car.getSceneModel().position

        if(carPos.z < 40) {
            carPos.z = 40
        }

        if(carPos.x < -20) {
            carPos.x = -20
        }

        if(carPos.x > this.columnsNumber + 20) {
            carPos.x = this.columnsNumber + 20
        }

        if(carPos.z > this.rowsNumber + 20) {
            carPos.z = this.rowsNumber + 20
        }
    }

    public detectAreas(): void {
        const carPos = this.car.getSceneModel().position

        this.props.container.getUpdatableComponents()
            .filter(s => s instanceof Area && !s.areaProps.components.some(s => s instanceof Car) && s.isObstacle())
            .forEach(c => {
                const p = c as Area

                if(
                    carPos.z > p.areaProps.position.z - Collision.diff && carPos.z < p.areaProps.position.z + Collision.diff &&
                    carPos.x > p.areaProps.position.x - Collision.diff && carPos.x < p.areaProps.position.x + Collision.diff
                ) {
                    const deltaX = Math.abs(carPos.x - p.areaProps.position.x);
                    const deltaZ = Math.abs(carPos.z - p.areaProps.position.z);

                    if (deltaX > deltaZ) {
                        if (carPos.x > p.areaProps.position.x) {
                            this.car.getSceneModel().position.x = p.areaProps.position.x + Collision.diff;
                        } else {
                            this.car.getSceneModel().position.x = p.areaProps.position.x - Collision.diff;
                        }
                    } else {
                        if (carPos.z > p.areaProps.position.z) {
                            this.car.getSceneModel().position.z = p.areaProps.position.z + Collision.diff;
                        } else {
                            this.car.getSceneModel().position.z = p.areaProps.position.z - Collision.diff;
                        }
                    }
                }
            })
    }
}