import {Component} from "../component/Component";
import {GlobalProps, LoadedModel} from "../type";
import {Vector3} from "three";


export class Buildings extends Component {
    public static readonly modelName = "heliport"
    public static readonly heliportPosition = new Vector3(25, -3, -30)

    constructor(
        private props: GlobalProps,
        model: LoadedModel,
        id: string
    ) {
        super(id, model, props);
    }

    isObstacle(): boolean {
        return false;
    }
}