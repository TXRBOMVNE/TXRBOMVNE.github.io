import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { updateProfile } from 'firebase/auth';
import { take } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { LoadingService } from '../extras/loading-animation/loading-animation.service';
import { SpotifyTrack } from '../models/song.model';
import { UserService } from './user.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
  animations: [
    trigger('appear', [
      transition(':enter', [
        style({ position: 'absolute', opacity: 0 }),
        animate('150ms 150ms ease-in-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('150ms ease-in-out', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class UserComponent implements OnInit {

  constructor(private userService: UserService,
    private fireAuth: AngularFireAuth,
    private storage: AngularFireStorage,
    private authService: AuthService,
    private firestore: AngularFirestore,
    private loadingService: LoadingService) { }

  currentFirebaseUser: firebase.default.User | null = null
  profileForm = new FormGroup({
    email: new FormControl(null, [Validators.required, Validators.email]),
    username: new FormControl(null, Validators.required)
  })
  passwordForm = new FormGroup({
    newPassword: new FormControl(null, [Validators.required, Validators.minLength(6), Validators.pattern('^[a-zA-Z]+$')]),
    confirmPassword: new FormControl(null, [Validators.required, this.matchPasswordValidator()])
  })
  showTabs: boolean = false
  editMode: boolean = false
  changePasswordMode: boolean = false
  fileUploadErrorMessage?: string
  uploadPercentage?: number
  userTabTracks?: SpotifyTrack[]
  imageSrc?: string

  ngOnInit(): void {
    this.fireAuth.onAuthStateChanged(user => {
      this.currentFirebaseUser = user
      this.profileForm.patchValue({
        email: user?.email,
        username: user?.displayName
      })
      if (!user) return
      this.requestTabs()
    })
    setTimeout(() => {
      this.imageSrc = 'https://firebasestorage.googleapis.com/v0/b/tab-player.appspot.com/o/default_profile.png?alt=media&token=631da581-8c28-4504-88ae-207b61e334b4'
    }, 2500)
  }

  requestTabs() {
    this.loadingService.isLoading.next(true)
    this.userService.getUserTabIds(this.currentFirebaseUser!.uid).pipe(take(1)).subscribe(tabIdsArray => {
      if (!tabIdsArray || tabIdsArray.length === 0) {
        this.loadingService.isLoading.next(false)
        return
      }
      this.loadingService.isLoading.next(false)
      this.authService.getAccessToken().pipe(take(1)).subscribe(token => {
        this.userService.getUserTabSpotifyTracks(tabIdsArray, token).pipe(take(1)).subscribe((trackArray: any) => {
          this.userTabTracks = trackArray
          if (this.userTabTracks?.length !== 0) {
            this.userTabTracks?.sort((a, b) => {
              return ('' + a.artists[0].name).localeCompare(b.artists[0].name) || ('' + a.album.name).localeCompare(b.album.name)
            })
          } else if (!trackArray) {
          }
          this.loadingService.isLoading.next(false)
        })
      })
    })
  }

  requestUpdateProfile() {
    this.userService.requestUpdateProfile(this.profileForm.value.email, this.profileForm.value.username).pipe(take(1)).subscribe(() => this.editMode = false)
  }

  updatePassword() {
    if (this.passwordForm.invalid) return
    this.userService.requestUpdatePassword(this.passwordForm.value.newPassword).then(() => this.changePasswordMode = false)
  }

  uploadNewProfilePic(event: any) {
    if (!this.currentFirebaseUser || !event || event.target.files.length === 0) return
    let file: File = event.target.files[0]
    if (!file.type.startsWith('image')) {
      this.fileUploadErrorMessage = 'Please upload a valid image format'
      return
    } else if (file.size > 4194304) {
      this.fileUploadErrorMessage = 'File size limit is 4 MB'
      return
    } else this.fileUploadErrorMessage = undefined
    let upload = this.storage.upload(this.currentFirebaseUser.uid, file)
    upload.then(res => {
      this.storage.ref(res.metadata.fullPath).getDownloadURL().pipe(take(1))
        .subscribe(photoURL => {
          this.firestore.collection('users').doc(this.currentFirebaseUser?.uid).update({ photoURL }).catch(err => {
            if (err.code === 'not-found') {
              this.firestore.collection('users').doc(this.currentFirebaseUser?.uid).set({ photoURL })
            }
          })
          updateProfile(this.currentFirebaseUser!, { photoURL }).then(() => this.fireAuth.updateCurrentUser(this.currentFirebaseUser))
        })
    })
      .catch(err => console.log(err))
    let sub = upload.percentageChanges().subscribe(percentage => {
      this.uploadPercentage = percentage
      if (percentage === 100) {
        sub.unsubscribe()
        setTimeout(() => {
          this.uploadPercentage = undefined
        }, 1000);
      }
    })
  }

  logOut() {
    this.authService.logOut()
  }

  deleteTab(trackId: string) {
    this.firestore.collection('users').doc(this.currentFirebaseUser?.uid).collection('tabs').doc(trackId).delete().then(() => this.requestTabs())
  }

  private matchPasswordValidator(): ValidatorFn {
    return (): ValidationErrors | null => {
      if (!this.passwordForm) return null
      const password = this.passwordForm.get('newPassword')?.value
      const confirmPassword = this.passwordForm.get('confirmPassword')?.value
      if (password === confirmPassword) {
        return null
      } else {
        return { incorrectPassword: true }
      }
    }
  }
}
