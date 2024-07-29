
export namespace CarEvents {
    export class Names {
        public static readonly blinkLeftOn = "blink_left_on"
        public static readonly blinkRightOn = "blink_right_on"
        public static readonly blinkOff = "blink_off"
        public static readonly gasOn = "gas_on"
        public static readonly gasOff = "gas_off"
        public static readonly DecreasedFuel = "decreased_fuel"
        public static readonly Created = "car_created"
        public static readonly Removed = "car_removed"
    }

    export class DecreasedFuelEvent extends Event {
        constructor(
            public readonly newFuelValue: number
        ) {
            super(CarEvents.Names.DecreasedFuel);
        }
    }
}