import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Router } from '@angular/router';

import * as firebase from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private user: Observable<firebase.User>;
  private userDetails: firebase.User = null;

  constructor(private _firebaseAuth: AngularFireAuth,
              private router: Router) {
    this.user = _firebaseAuth.authState;
    this.user.subscribe(
      (user) => {
        if (user) {
          this.userDetails = user;
          console.log(this.userDetails);
        }
      }
    );
  }

  createWithEmail(email, password) {
    return this._firebaseAuth.auth.createUserWithEmailAndPassword(email, password)
  }

  signInWithEmail(email, password) {
    const credential = firebase.auth.EmailAuthProvider.credential(email, password);
    return this._firebaseAuth.auth.signInWithEmailAndPassword(email, password)
  }

  isLoggedIn() {
    if (this.userDetails == null ) {
      return false;
    } else {
      return true;
    }
  }

  logout() {
    if (this.userDetails != null) {
      this._firebaseAuth.auth.signOut()
      .then((res) => {
        this.userDetails = null;
        this.router.navigate(['/homepage']);
      });
    }
  }
}
