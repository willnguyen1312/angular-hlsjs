import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Input,
  SimpleChanges,
} from '@angular/core';
import { MediaService } from '../mediaService/media.service';
import { Media } from '../mediaService/media.model';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.css'],
})
export class VideoComponent implements OnInit {
  @Input() videoSource: string;
  @ViewChild('video') videoRef: ElementRef;
  _media: Media;

  constructor(public mediaService: MediaService) {
    mediaService.media$.subscribe((media) => (this._media = media));
  }

  ngOnInit(): void {}

  ngAfterViewInit() {
    const mediaElement = this.videoRef.nativeElement as HTMLVideoElement;
    this.mediaService.initHls(this.videoSource, mediaElement);
  }

  ngOnDestroy() {
    this.mediaService.releaseHls();
  }

  ngOnChanges(changes: SimpleChanges) {
    const mediaElement =
      this.videoRef && (this.videoRef.nativeElement as HTMLVideoElement);
    if (changes.videoSource && mediaElement) {
      this.mediaService.initHls(this.videoSource, mediaElement);
      mediaElement.pause();
    }
  }
}
