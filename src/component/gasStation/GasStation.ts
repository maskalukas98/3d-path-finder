import {UpdatableComponent} from "../Component";
import {AreaComponent, Behaviour, GlobalProps, LoadedModel} from "../../type";
import {Clock, Vector3} from "three";
import {GasStationTankBehaviour} from "./GasStationTankBehaviour";
import * as THREE from "three";
import {IdleBehaviour} from "../behaviour/IdleBehaviour";

export enum GasState  {
    Idle,
    TankStart,
    TankProcess,
    TankStop
}


export class GasStation extends UpdatableComponent implements AreaComponent {
    public static readonly modelName = "gas-station"

    private behaviour: Behaviour
    public mixer: THREE.AnimationMixer

    constructor(
        private props: GlobalProps,
        model: LoadedModel,
        id: string
    ) {
        super(id, model, props);
        this.mixer = new THREE.AnimationMixer(this.model.scene)
        this.behaviour = new IdleBehaviour()
    }

    handleInput() {
    }

    update(clock: Clock, deltaTime: number) {
        this.mixer.update(deltaTime)
        this.behaviour.update(clock, deltaTime)
    }

    destructor() {
    }

    public canBeWithMultipleComponentsInArea(): boolean {
        return false
    }

    public startTanking(): void {
        this.behaviour = new GasStationTankBehaviour(this.props, this.model, this)
    }

    public isObstacle(): boolean {
        return false;
    }
}