import {VideoPlayer} from "./VideoPlayer";
import {Clearable} from "../../type";

export class VideoRecording implements Clearable {
    public readonly mediaRecorder!: MediaRecorder

    private readonly frameRequestRate = 30
    private readonly stream: MediaStream
    private type = "video/webm"
    private mimeType = "video/webm; codecs=vp9"
    private readonly recordedChunks: Blob[] = []
    private recordCircleHtml = document.getElementById("record-circle") as HTMLDivElement
    private videoPlayer?: VideoPlayer

    constructor(
        private canvas: HTMLCanvasElement
    ) {
        this.stream = this.canvas.captureStream(this.frameRequestRate)
        this.mediaRecorder = new MediaRecorder(this.stream, {
            mimeType: this.mimeType
        });

        this.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                this.recordedChunks.push(event.data);
            }
        };
    }

    public recordingSwitch(): void {
        if(this.mediaRecorder.state !== "inactive") {
            this.stop(blob => {
                this.videoPlayer = new VideoPlayer(this.getBlob())
                this.videoPlayer.showVideo()
            })
        } else {
            this.start()
        }
    }

    public clear(): void {
        this.videoPlayer?.clear()
    }

    private start(): void {
        this.recordedChunks.length = 0
        this.mediaRecorder.start()

        this.recordCircleHtml.classList.remove("inactive")
        this.recordCircleHtml.classList.add("recording")
    }

    private stop(callback: (blob: Blob) => void): boolean {
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.onstop = (e) => {
                callback(this.getBlob())
            }

            this.recordCircleHtml.classList.remove("recording")
            this.recordCircleHtml.classList.add("inactive")
            this.mediaRecorder.stop();
            return true
        }

        return false
    }

    private getBlob(): Blob {
        return new Blob(this.recordedChunks, { type: this.type })
    }
}