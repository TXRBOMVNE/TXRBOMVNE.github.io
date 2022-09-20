import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { BehaviorSubject, first, Subject } from 'rxjs';

export interface User {
  refreshToken?: string,
  uid?: string,
  spotifyCode?: string
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private firebaseAuth: AngularFireAuth, private firestore: AngularFirestore) { }

  currentUser = new BehaviorSubject<User | null>(null)

  requestLogin(user: { email: string, password: string }) {
    return this.firebaseAuth.signInWithEmailAndPassword(user.email, user.password)
  }

  requestSignUp(user: { email: string, password: string, username: string }) {
    return this.firebaseAuth.createUserWithEmailAndPassword(user.email, user.password)
  }

  createUserData(username: string, uid: string) {
    return this.firestore.collection("users").doc(uid).set({ username: username })
  }
}
