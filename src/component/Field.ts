import {Component} from "./Component";
import {AreaComponent, GlobalProps, LoadedModel} from "../type";

export class Field extends Component implements AreaComponent {
    public static readonly modelName = "field"

    constructor(
        props: GlobalProps,
        model: LoadedModel,
    ) {
        super("field", model, props);
    }

    canBeWithMultipleComponentsInArea(): boolean {
        return true
    }

    public isObstacle(): boolean {
        return true;
    }
}