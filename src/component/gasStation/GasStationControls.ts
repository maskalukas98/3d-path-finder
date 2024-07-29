import {GasStation} from "./GasStation";
import {AreaGasStationEnteredEvent} from "../../World/fields/GasStationArea";
import {GlobalProps, UnRegisterEvent} from "../../type";
import {Car} from "../car/Car";
import {GasStationEvents} from "./GasStationEvents";

export class GasStationControls implements UnRegisterEvent {
    private currentGasStation!: GasStation;

    private onAreaGasStationEnteredHandler: (e: Event) => void

    constructor(
        private props: GlobalProps
    ) {
        this.onAreaGasStationEnteredHandler = this.onAreaGasStationEntered.bind(this)

        this.registerEventListeners()

        document.getElementById("fuel-btn")?.addEventListener("click", () => {
            this.chooseTankOptionInQuestion()
        })

        document.getElementById("dont-fuel-btn")?.addEventListener("click", () => {
            this.hideTankAskQuestion()
        })
    }

    public unRegisterEventListeners(): void {
        this.props.eventEmitter.removeEventListener(
            GasStationEvents.Names.AreaGasStationEntered,
            this.onAreaGasStationEnteredHandler
        )

        //this.currentGasStation.removeEventListener(GasStationEvents.Names.TankingFinished, onTankingFinished)
    }

    private registerEventListeners(): void {
        this.props.eventEmitter.addEventListener(
            GasStationEvents.Names.AreaGasStationEntered,
            this.onAreaGasStationEnteredHandler
        )
    }

    private showGasStationAskFuelQuestion(gasStation: GasStation): void {
        const gasStationAskSectionHtml =  document.getElementById("gas-station-ask")

        if(gasStationAskSectionHtml) {
            this.currentGasStation = gasStation
            gasStationAskSectionHtml.style.display = "flex"
        }
    }

    private chooseTankOptionInQuestion(): void {
        const onTankingFinished = () => {
            this.currentGasStation.removeEventListener(GasStationEvents.Names.TankingFinished, onTankingFinished)
        }

        this.hideTankAskQuestion()
       // this.currentGasStation.addEventListener(GasStationEvents.TankingFinished, onTankingFinished.bind(this))
        this.currentGasStation.startTanking()
    }

    private hideTankAskQuestion(): void {
        const gasStationAskSectionHtml =  document.getElementById("gas-station-ask") as HTMLElement
        gasStationAskSectionHtml.style.display = "none"
        const car = this.props.container.getUpdatableComponents().find(s => s instanceof Car)

        if(car) {
            car.stopUpdate = false
        }
    }

    // handlers
    private onAreaGasStationEntered(e: Event): void {
        this.showGasStationAskFuelQuestion((e as AreaGasStationEnteredEvent).gasStation)
    }
}