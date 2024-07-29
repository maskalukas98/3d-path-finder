import {GasStation} from "./GasStation";

export namespace GasStationEvents {
    export class Names {
        public static readonly AreaGasStationEntered = "area_gas_station_entered"
        public static readonly TankingFinished = "gas_tanking_finished"
    }

    export class AreaGasStationEnteredEvent extends Event {
        constructor(
            public readonly gasStation: GasStation
        ) {
            super(GasStationEvents.Names.AreaGasStationEntered);
        }
    }
}