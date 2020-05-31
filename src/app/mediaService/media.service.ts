import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import Hls from 'hls.js';

import { Media, BitrateInfo } from './media.model';
import { convertTimeRangesToSeconds } from './utils';

const initialMedia: Media = {
  autoBitrateEnabled: true,
  bitrates: [],
  buffered: null,
  currentBirateIndex: -1,
  currentTime: 0,
  duration: 0,
  ended: false,
  fps: 0,
  isLoading: true,
  muted: false,
  paused: true,
  playbackRate: 1,
  volume: 1,
};

@Injectable({ providedIn: 'root' })
export class MediaService {
  private readonly _media = new BehaviorSubject<Media>(initialMedia);
  private _hls: null | Hls = null;
  private mediaElement: null | HTMLVideoElement = null;
  private _currentMediaSource = '';
  private isPlaying = false;

  readonly media$ = this._media.asObservable();

  get media(): Media {
    return this._media.getValue();
  }

  set todos(val: Media) {
    this._media.next(val);
  }

  initHls(mediaSource: string, mediaElement: HTMLVideoElement) {
    this.mediaElement = mediaElement;
    this.releaseHls();

    if (Hls.isSupported() && this._currentMediaSource !== mediaSource) {
      this._currentMediaSource = mediaSource;
      const newHls = new Hls();
      newHls.attachMedia(mediaElement);
      newHls.on(Hls.Events.MEDIA_ATTACHED, () => {
        newHls.loadSource(mediaSource);
      });

      newHls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        const bitrates: BitrateInfo[] = ((data.levels as unknown) as Hls.Level[]).map(
          (level) => ({
            bitrate: level.bitrate,
            height: level.height,
            width: level.width,
          })
        );

        this.media.bitrates = bitrates;
      });

      newHls.on(Hls.Events.FRAG_PARSING_DATA, (_, data) => {
        if (data.type === 'video') {
          const fps = data.nb / (data.endPTS - data.startPTS);
          this.media.fps = Math.round(fps);
        }
      });

      newHls.on(Hls.Events.LEVEL_SWITCHED, (_, { level }) => {
        this.media.currentBirateIndex = level;
      });
    } else if (
      mediaElement &&
      mediaElement.canPlayType('application/vnd.apple.mpegurl')
    ) {
      // For native support like Apple's safari
      mediaElement.src = mediaSource;
    }
  }

  releaseHls() {
    if (this._hls) {
      this._hls.destroy();
    }
  }

  private getMedia() {
    const media = this.mediaElement;
    if (!media) {
      throw new Error('media element is not available');
    }
    return media as HTMLMediaElement;
  }

  private checkMediaHasDataToPlay() {
    const media = this.getMedia();
    const currentTime = media.currentTime;
    const timeRanges = convertTimeRangesToSeconds(media.buffered);

    return timeRanges.some((timeRange) => {
      const [start, end] = timeRange;
      return currentTime >= start && currentTime <= end;
    });
  }

  onSeeking() {
    const media = this.getMedia();
    this.media.currentTime = media.currentTime;
    this.media.isLoading = this.checkMediaHasDataToPlay();
  }

  async onLoadedMetadata() {
    while (this.getMedia().duration === Infinity) {
      // Loop until duration is ready
      await new Promise((res) => setTimeout(res, 100));
    }

    this.media.duration = this.getMedia().duration;
  }

  onRateChange() {
    this.media.playbackRate = this.getMedia().playbackRate;
  }

  onVolumeChange() {
    const media = this.getMedia();
    this.media.muted = media.muted;
    this.media.volume = media.volume;
  }

  onPause() {
    this.media.paused = true;
    this.isPlaying = false;
  }

  onPlay() {
    this.media.paused = false;
    this.media.ended = false;
  }

  onCanPlay() {
    this.media.isLoading = false;
  }

  onProgress() {
    this.media.isLoading = false;
    this.media.buffered = this.getMedia().buffered;
  }

  onWaiting() {
    this.media.isLoading = this.checkMediaHasDataToPlay();
  }

  onTimeUpdate() {
    this.media.currentTime = this.getMedia().currentTime;
  }

  onEnded() {
    this.media.ended = true;
  }

  onPlaying() {
    this.isPlaying = true;
  }
}
