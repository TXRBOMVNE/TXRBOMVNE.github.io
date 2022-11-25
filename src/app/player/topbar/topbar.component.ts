import { animate, style, transition, trigger } from '@angular/animations';
import { DOCUMENT } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Inject, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { firstValueFrom, Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { SpotifyTrack } from 'src/app/models/song.model';
import { AppStatus } from '../player.component';
import { PlayerService } from '../player.service';
import { TabService } from '../tab/tab.service';

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady(): void;
    Spotify: typeof Spotify;
  }
}

declare namespace Spotify {
  interface Entity {
    name: string;
    uri: string;
    url: string;
  }

  interface Album {
    name: string;
    uri: string;
    images: Image[];
  }

  interface Error {
    message: string;
  }

  type ErrorTypes = 'account_error' | 'authentication_error' | 'initialization_error' | 'playback_error';

  interface Image {
    height?: number | null | undefined;
    url: string;
    size?: string | null | undefined;
    width?: number | null | undefined;
  }

  interface PlaybackContextTrack extends Entity {
    artists: Entity[];
    content_type: string;
    estimated_duration: number;
    group: Entity;
    images: Image[];
    uid: string;
  }

  interface PlaybackContextRestrictions {
    pause: string[];
    resume: string[];
    seek: string[];
    skip_next: string[];
    skip_prev: string[];
    toggle_repeat_context: string[];
    toggle_repeat_track: string[];
    toggle_shuffle: string[];
    peek_next: string[];
    peek_prev: string[];
  }

  interface PlaybackContextMetadata extends Entity {
    current_item: PlaybackContextTrack;
    next_items: PlaybackContextTrack[];
    previous_items: PlaybackContextTrack[];
    restrictions: PlaybackContextRestrictions;
    options: {
      repeat_mode: string;
      shuffled: boolean;
    };
  }

  interface PlaybackContext {
    metadata: PlaybackContextMetadata | null;
    uri: string | null;
  }

  interface PlaybackDisallows {
    pausing?: boolean;
    peeking_next?: boolean;
    peeking_prev?: boolean;
    resuming?: boolean;
    seeking?: boolean;
    skipping_next?: boolean;
    skipping_prev?: boolean;
    toggling_repeat_context?: boolean;
    toggling_repeat_track?: boolean;
    toggling_shuffle?: boolean;
  }

  interface PlaybackRestrictions {
    disallow_pausing_reasons?: string[];
    disallow_peeking_next_reasons?: string[];
    disallow_peeking_prev_reasons?: string[];
    disallow_resuming_reasons?: string[];
    disallow_seeking_reasons?: string[];
    disallow_skipping_next_reasons?: string[];
    disallow_skipping_prev_reasons?: string[];
    disallow_toggling_repeat_context_reasons?: string[];
    disallow_toggling_repeat_track_reasons?: string[];
    disallow_toggling_shuffle_reasons?: string[];
  }

  interface PlaybackState {
    context: PlaybackContext;
    disallows: PlaybackDisallows;
    duration: number;
    paused: boolean;
    position: number;
    loading: boolean;
    timestamp: number;
    /**
     * 0: NO_REPEAT
     * 1: ONCE_REPEAT
     * 2: FULL_REPEAT
     */
    repeat_mode: 0 | 1 | 2;
    shuffle: boolean;
    restrictions: PlaybackRestrictions;
    track_window: PlaybackTrackWindow;
    playback_id: string;
    playback_quality: string;
    playback_features: {
      hifi_status: string;
    };
  }

  interface PlaybackTrackWindow {
    current_track: Track;
    previous_tracks: Track[];
    next_tracks: Track[];
  }

  interface PlayerInit {
    name: string;
    getOAuthToken(cb: (token: string) => void): void;
    volume?: number | undefined;
  }

  type ErrorListener = (err: Error) => void;
  type PlaybackInstanceListener = (inst: WebPlaybackInstance) => void;
  type PlaybackStateListener = (s: PlaybackState) => void;
  type EmptyListener = () => void;

  type AddListenerFn =
    & ((event: 'ready' | 'not_ready', cb: PlaybackInstanceListener) => void)
    & ((event: 'autoplay_failed', cb: EmptyListener) => void)
    & ((event: 'player_state_changed', cb: PlaybackStateListener) => void)
    & ((event: ErrorTypes, cb: ErrorListener) => void);

  class Player {
    readonly _options: PlayerInit & { id: string };
    constructor(options: PlayerInit);

    connect(): Promise<boolean>;
    disconnect(): void;
    getCurrentState(): Promise<PlaybackState | null>;
    getVolume(): Promise<number>;
    nextTrack(): Promise<void>;

    addListener: AddListenerFn;
    on: AddListenerFn;

    removeListener(
      event: 'ready' | 'not_ready' | 'player_state_changed' | ErrorTypes,
      cb?: ErrorListener | PlaybackInstanceListener | PlaybackStateListener,
    ): void;

    pause(): Promise<void>;
    previousTrack(): Promise<void>;
    resume(): Promise<void>;
    seek(pos_ms: number): Promise<void>;
    setName(name: string): Promise<void>;
    setVolume(volume: number): Promise<void>;
    togglePlay(): Promise<void>;

    activateElement(): Promise<void>;
  }

  interface Track {
    album: Album;
    artists: Entity[];
    duration_ms: number;
    id: string | null;
    is_playable: boolean;
    name: string;
    uid: string;
    uri: string;
    media_type: 'audio' | 'video';
    type: 'track' | 'episode' | 'ad';
    track_type: 'audio' | 'video';
    linked_from: {
      uri: string | null;
      id: string | null;
    };
  }

  interface WebPlaybackInstance {
    device_id: string;
  }
}


@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css'],
  animations: [
    trigger("appear", [
      transition(":enter", [
        style({ opacity: 0 }),
        animate("300ms 500ms ease-in-out", style({ opacity: 1 }))
      ]),
      transition(":leave", [
        animate("300ms 500ms  ease-in-out", style({ opacity: 0 }))
      ])
    ])
  ]
})
export class TopbarComponent implements OnInit, AfterViewInit {

  constructor(
    private tabService: TabService,
    private playerService: PlayerService,
    private authService: AuthService,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document) { }

  @Output() appStatusOutput = new EventEmitter<AppStatus>()

  appStatus: AppStatus = {
    isPlaying: false,
    isMenuActive: false,
    isCountdownActive: false,
    isMetronomeActive: false,
    tempoMultiplier: 100
  }
  currentSpotifyTrack?: SpotifyTrack
  subs: Subscription[] = []
  isImgLoaded = false

  ngOnInit(): void {
    this.appStatusOutput.emit(this.appStatus)
    const currentSpotifyTrackSub = this.playerService.currentSpotifyTrack.subscribe(track => {
      if (!track) return
      this.currentSpotifyTrack = track!
    })
    const isPlayingSub = this.tabService.isPlaying.subscribe(isPlaying => {
      if (isPlaying) {
        this.appStatus.isPlaying = true
      } else {
        this.appStatus.isPlaying = false
      }
    })
    this.subs.push(isPlayingSub, currentSpotifyTrackSub)
  }

  async ngAfterViewInit() {
    this.initSpotify()
  }

  openMenu() {
    this.appStatus.isMenuActive = true
    this.appStatusOutput.emit(this.appStatus)
  }

  updateTempo() {
    this.appStatusOutput.emit(this.appStatus)
  }

  play() {
    this.tabService.play()
  }

  pause() {
    this.tabService.pause()
  }

  @ViewChild('togglePlay') togglePlay?: ElementRef<HTMLDivElement>
  async initSpotify() {
    const spotifyScript = this.renderer.createElement("script");
    spotifyScript.src = "https://sdk.scdn.co/spotify-player.js";
    spotifyScript.async = true;
    this.renderer.appendChild(this.document.body, spotifyScript);
    const token = await firstValueFrom(this.authService.getAccessToken());
    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new Spotify.Player({
        name: 'L2P',
        getOAuthToken: (cb: any) => { cb(token); },
        volume: 1
      });

      // Ready
      player.addListener('ready', ({ device_id }: any) => {
        console.log('Ready with Device ID', device_id);
      });

      // Not Ready
      player.addListener('not_ready', ({ device_id }: any) => {
        console.log('Device ID has gone offline', device_id);
      });

      player.addListener('player_state_changed', (status) => {
        if (!status) return this.pause()
        if (status.paused) {
          this.pause()
        } else {
          this.play()
        }
      })

      player.addListener('initialization_error', ({ message }: any) => {
        console.error(message);
      });

      player.addListener('authentication_error', ({ message }: any) => {
        console.error(message);
      });

      player.addListener('account_error', ({ message }: any) => {
        console.error(message);
      });

      this.togglePlay!.nativeElement.onclick = function () {
        player.togglePlay();
      };

      player.connect();
      player.seek(0)

      const isPlayingSub = this.tabService.isPlaying.subscribe(isPlaying => {
        if (isPlaying) {
          this.appStatus.isPlaying = true
          player.resume()
        } else {
          this.appStatus.isPlaying = false
          player.pause()
        }
      })

    }
  }
}

