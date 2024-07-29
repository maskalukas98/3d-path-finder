import {Clearable} from "../../type";

type Elements = {
    analyzingText: HTMLSpanElement,
    analyze: HTMLDivElement,
    analyzeBoxes: HTMLDivElement,
}

export class Analyzator implements  Clearable {
    private htmlElements: Elements
    private displayed = false

    constructor() {
        this.htmlElements = {
            analyzingText: document.getElementById("analyze-text-simulation") as HTMLSpanElement,
            analyzeBoxes: document.getElementById("analyze-boxes") as HTMLDivElement,
            analyze: document.getElementById("analyze") as HTMLDivElement,
        }
    }

    public start(): void {
        if(this.displayed) {
            this.htmlElements.analyzingText.style.display = "none"
            this.htmlElements.analyzeBoxes.style.display = "none"
            this.displayed = false
            return
        }

        this.displayed = true
        this.htmlElements.analyzingText.style.display = 'block';
        this.htmlElements.analyze.style.display = "block";

        setTimeout(() => {
            this.htmlElements.analyzeBoxes.style.display = "block"
            this.htmlElements.analyzingText.style.display = "none"
        }, 2000)
    }

    public clear(): void {
        this.displayed = false
        this.htmlElements.analyzingText.style.display = "none"
        this.htmlElements.analyzeBoxes.style.display = "none"
    }
}