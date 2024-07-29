import {b} from "vite/dist/node/types.d-aGj9QkWt";

export class Phase {
    private completed = false;
    private started = false;
    private before = true

    public completeBefore(): void {
        this.before = false;
    }

    start(): void {
        this.started = true;
    }

    complete(): void {
        this.completed = true;
    }

    public stop(): void {
        this.started = false
    }

    public isCompleted(): boolean {
        return this.completed;
    }

    public hasStarted(): boolean {
        return this.started;
    }

    public isBefore(): boolean {
        return this.before
    }
}