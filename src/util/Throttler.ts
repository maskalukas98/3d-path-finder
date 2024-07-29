export class Throttler {
    private inThrottle = false

    constructor(
        private func: (...args: any) => void,
        private  limit: number
    ) {}

    execute(...args: any) {
        if (!this.inThrottle) {
            this.func.apply(this, args);
            this.inThrottle = true;
            setTimeout(() => this.inThrottle = false, this.limit);
        }
    }
}
