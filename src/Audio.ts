import {Camera} from "./Camera";
import {Resources} from "./Resources";
import { Howl, Howler } from 'howler'

type Fade = {
    from: number,
    to: number,
    duration: number
}

export class Audio {
    // car
    public static readonly CarDriveSoundName = "carDriveSound"
    public static readonly CarStartSoundName = "carStartSound"
    public static readonly CarBrakeSoundName = "carBrakeSound"

    // meteor
    public static readonly MeteorHitSoundName = "meteorHitSound"
    public static readonly MeteorFlySoundName = "meteorFlySound"

    // gas
    public static readonly GasPumpingSoundName = "gasPumpingSound"

    // helicopter
    public static readonly HelicopterBladeSoundName = "helicopterBladeSound"

    // game state
    public static readonly GameVictory = "victory"
    public static readonly GameDefeat = "fiasco"
    public static readonly GameMusic = "gameMusicLoop"


    public static readonly resources = [
        // game state
        {name: Audio.GameMusic, src: "./static/audio/game_music_loop.mp3", loop: true },
        { name: Audio.GameVictory, src: "./static/audio/victory.mp3", loop: false },
        { name: Audio.GameDefeat, src: "./static/audio/fiasco.mp3", loop: false },

        // car
        { name: Audio.CarDriveSoundName, src: './static/audio/low_off.mp3', loop: true },
        { name: Audio.CarStartSoundName, src: './static/audio/car_engine_starting.mp3', loop: false },
        { name: Audio.CarBrakeSoundName, src: './static/audio/car_brake.mp3', loop: false },

        // meteor
        { name: Audio.MeteorHitSoundName, src: './static/audio/meteor_hit.mp3', loop: false },
        { name:  Audio.MeteorFlySoundName, src: './static/audio/meteor_fly.mp3', loop: true },

        // gas
        { name: Audio.GasPumpingSoundName, src: './static/audio/gas_pumping.mp3', loop: true },

        // helicopter
        { name: Audio.HelicopterBladeSoundName, src: './static/audio/helicopter_blade.mp3', loop: true },
    ];

    private isAudioAllowed = true;
    private sounds: { [key: string]: Howl | null } = {};
    private previousSound?: Howl;
    private currentSound?: Howl;

    constructor(camera: Camera, private resource: Resources) {
        this.loadResources()
    }

    private loadResources(): void {
        Audio.resources.forEach(({ name, src, loop }) => {
            this.sounds[name] = this.createSound(name, src, loop);
        });
    }

    private createSound(name: string, src: string, loop = false): Howl {
        const sound = new Howl({
            src: [src],
            loop: loop,
        });

        sound.on("load", (err) => {

            if(name === Audio.GameMusic) {
                console.log("LOOOOP")
            }

            this.resource.updateApplicationIntoLoader()
            this.resource.increaseCurrentLoaded();
        });

        return sound;
    }

    public toggleAudioPermission(): boolean {
        this.isAudioAllowed = !this.isAudioAllowed;
        Howler.mute(!this.isAudioAllowed);

        return this.isAudioAllowed
    }

    public getIsAudioAllowed(): boolean {
        return this.isAudioAllowed
    }

    private playSound(name: string, volume: number = 0.7, fade?: Fade): void {
        //if (!this.isAudioAllowed) return;

        const sound = this.sounds[name];
        if (!sound) {
            throw new Error("Sound "+  +"does not exist.")
        }

        this.previousSound = this.currentSound;
        this.currentSound = sound;

        sound.volume(volume);

        if (fade) {
            sound.fade(fade.from, fade.to, fade.duration);
        }

        sound.play();

        if(!this.isAudioAllowed) {
            Howler.mute(true);
        }
    }

    private stopSound(name: string): void {
        const sound = this.sounds[name];
        if (!sound) return;

        sound.stop();
    }

    public play(name: string, volume: number = 0.7, fade?: Fade): void {
        this.playSound(name, volume, fade);
    }

    public stop(name: string): void {
        this.stopSound(name);
    }

    public playPreviousSound(): void {
        if (!this.previousSound) return;

        this.currentSound = this.previousSound;
        this.currentSound.play();
    }

    public clear(): void {
        Object.entries(this.sounds).forEach(([soundName, sound]) => {
            if(sound) {
                sound.stop()
                sound.unload()
                this.sounds[soundName] = null
            }
        })
    }
}