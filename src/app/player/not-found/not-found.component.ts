import { AfterViewInit, Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.css']
})
export class NotFoundComponent implements OnInit, AfterViewInit {

  constructor(private route: ActivatedRoute, private fireAuth: AngularFireAuth) { }

  imageSrc?: string
  loaded: boolean = false

  ngOnInit(): void {
    this.fireAuth.onAuthStateChanged(user => this.imageSrc = user?.photoURL!)
  }

  errorMessage = ''
  ngAfterViewInit(): void {
    setTimeout(() => {
      const statusCode = +this.route.snapshot.queryParamMap.get('status')!
      switch (statusCode) {
        case 400:
          this.errorMessage = 'Something went wrong! Try again.'
          break;
        case 401:
          this.errorMessage = 'Something went wrong logging into Spotify! Try again.'
          break;
        case 404:
          this.errorMessage = 'Spotify couldn\'t find that song!'
          break;
        case 503:
          this.errorMessage = 'Spotify service is unavailable. Try later!'
          break;
        default:
          this.errorMessage = 'We didn\'t found a tab for that song!'
      }
    });
    setTimeout(() => {
      if (!this.imageSrc) {
        this.imageSrc = 'https://firebasestorage.googleapis.com/v0/b/tab-player.appspot.com/o/default_profile.png?alt=media&token=631da581-8c28-4504-88ae-207b61e334b4'
      }
    }, 2500)
  }
}
