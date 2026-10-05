import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  generateToken(): string { 
    return crypto.randomUUID();
  }

  saveToken(token: string): void {
    localStorage.setItem('authToken', token);
  } 
   getToken(): string | null {
    return localStorage.getItem('authToken');
  }
  removeToken(): string | null {
    const token = localStorage.getItem('authToken');
    localStorage.removeItem('authToken');
    return token;
  }
}