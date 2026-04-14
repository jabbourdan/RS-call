import { Component, ViewChild, ElementRef, OnInit, Inject, PLATFORM_ID, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';

@Component({
    selector: 'app-music-player',
    imports: [FormsModule],
    templateUrl: './music-player.component.html',
    styleUrl: './music-player.component.scss'
})
export class MusicPlayerComponent implements OnInit, AfterViewInit {
    
    @ViewChild('audioElement', { static: false }) audioElement!: ElementRef<HTMLAudioElement>;

    volume: number = 0.5;
    progress: number = 0;
    isPlaying: boolean = false;
    currentTime: number = 0;
    duration: number = 0;

    constructor(
        @Inject(PLATFORM_ID) private platformId: Object
    ) {}

    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            setTimeout(() => this.initializeAudio(), 0);  // Delay interaction with audio element until after view is initialized
        }
    }

    ngAfterViewInit() {
        if (isPlatformBrowser(this.platformId)) {
            const audio = this.audioElement.nativeElement;
            audio.onloadedmetadata = () => {
                this.updateDuration();
                this.isPlaying = false;  // Reset play state on load
            };
            audio.oncanplay = () => this.updateDuration();
        }
    }

    initializeAudio() {
        if (isPlatformBrowser(this.platformId)) {
            const audio = this.audioElement.nativeElement;
            if (audio.duration) {
                this.duration = audio.duration;
            }
        }
    }

    togglePlayPause() {
        if (isPlatformBrowser(this.platformId)) {
            const audio = this.audioElement.nativeElement;
            if (this.isPlaying) {
                audio.pause();  // Pause the music
            } else {
                audio.play();  // Play the music
            }
            this.isPlaying = !this.isPlaying;  // Toggle play state
        }
    }

    setVolume() {
        if (isPlatformBrowser(this.platformId)) {
            this.audioElement.nativeElement.volume = this.volume;
        }
    }

    updateProgressBar() {
        if (isPlatformBrowser(this.platformId)) {
            const audio = this.audioElement.nativeElement;
            this.currentTime = audio.currentTime;
            this.progress = (audio.currentTime / (audio.duration || 1)) * 100;
            if (audio.ended) {
                this.isPlaying = false;
                this.currentTime = 0;
            }
        }
    }

    updateDuration() {
        if (isPlatformBrowser(this.platformId)) {
            const audio = this.audioElement.nativeElement;
            if (!isNaN(audio.duration) && audio.duration > 0) {
                this.duration = audio.duration;
            }
        }
    }

    formatTime(seconds: number): string {
        if (seconds === undefined || isNaN(seconds) || seconds < 0) {
            return "0:00";
        }
        const minutes: number = Math.floor(seconds / 60);
        const secs: number = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }

    restart() {
        if (isPlatformBrowser(this.platformId)) {
            const audio = this.audioElement.nativeElement;
            audio.currentTime = 0;  // Restart the audio from the beginning
            this.isPlaying = true;
            audio.play();  // Start playing again
        }
    }

    rewind() {
        if (isPlatformBrowser(this.platformId)) {
            const audio = this.audioElement.nativeElement;
            audio.currentTime = Math.max(0, audio.currentTime - 10); // Rewind 10 seconds, but don't go below 0
        }
    }

    fastForward() {
        if (isPlatformBrowser(this.platformId)) {
            const audio = this.audioElement.nativeElement;
            audio.currentTime = Math.min(audio.duration, audio.currentTime + 10); // Fast-forward 10 seconds, but don't exceed duration
        }
    }

}