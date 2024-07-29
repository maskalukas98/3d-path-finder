import {ControlsBar} from "../../ControlsBar";

export class VideoPlayer {
    private videoPlayerHtmlElement = document.getElementById("videoPlayer") as HTMLVideoElement
    private videoPlayerBoxElement = document.getElementById("video-player-box") as HTMLDivElement

    // handlers
    private closeVideoPlayerHandler: () => void

    constructor(
        private blob: Blob
    ) {
        this.closeVideoPlayerHandler = this.closeVideoPlayer.bind(this)
        ControlsBar.getElementById("close-video-player-btn").addEventListener("click", this.closeVideoPlayerHandler)
    }

    public showVideo(): void {
        const videoURL = URL.createObjectURL(this.blob);
        this.videoPlayerHtmlElement.src = videoURL;

        this.videoPlayerHtmlElement.onerror = function(e) {
            console.error('Error loading video:', e);
        };

        this.videoPlayerHtmlElement.onload = function() {
            URL.revokeObjectURL(videoURL);
        };

        this.videoPlayerBoxElement.style.display = "flex";
    }

    public closeVideoPlayer(): void {
        this.clear()
    }

    public clear(): void {
        this.videoPlayerHtmlElement.pause()
        this.videoPlayerBoxElement.style.display = "none"
        ControlsBar.getElementById("close-video-player-btn").removeEventListener("click",this.closeVideoPlayerHandler)
    }
}
