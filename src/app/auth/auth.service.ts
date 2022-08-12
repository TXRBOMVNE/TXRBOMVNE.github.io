import { Injectable } from '@angular/core';

export interface User {
  displayName: string,
  imageUrl: string,
  accessToken: string
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }


}
