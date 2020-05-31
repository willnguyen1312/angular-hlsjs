export interface BitrateInfo {
  bitrate: number;
  width: number;
  height: number;
}

export interface Media {
  // Streaming properties
  fps: number;
  autoBitrateEnabled: boolean;
  bitrates: BitrateInfo[];
  currentBirateIndex: number;

  // Media properties
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
  paused: boolean;
  muted: boolean;
  ended: boolean;
  buffered: TimeRanges | null;
  isLoading: boolean;
}
