import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  public readonly videoSources = [
    {
      value: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      id: 0,
    },
    {
      value: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
      id: 1,
    },
    {
      value:
        'https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8',
      id: 2,
    },
  ];

  public currentMediaSource = this.videoSources[0].value;

  selectVideoSource(videoSourceId: number) {
    const selected = this.videoSources.find(
      (videoSource) => videoSource.id === videoSourceId
    );

    this.currentMediaSource = selected.value;
  }
}
