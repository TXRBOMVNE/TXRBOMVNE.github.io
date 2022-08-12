import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  requestSpotifyAuth() {
    let authLink = `https://accounts.spotify.com/authorize?` + new HttpParams(
      {
        fromObject:
        {
          client_id: environment.spotify.id,
          response_type: "code",
          scope: "streaming",
          redirect_uri: "http://localhost:4200/play",
        }
      }
    )
    window.open(authLink, "_self")
  }
}
