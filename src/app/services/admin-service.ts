import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// Mirrors UserResponse. `id` is a UUID string.
export interface AppUser {
  id: string;
  email: string;
  role?: string;
  is_active?: boolean;
  total_query?: number;
  created_at?: string;
  updated_at?: string;
}

// Maps to UserUpdate. The service uses exclude_unset=True, so only send changed fields.
export interface UserPatch {
  email?: string;
  password?: string;
}

// Maps to UserCreate. The server hashes the password and assigns the id.
export interface NewUser {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})

export class AdminService {

  // The collection routes are declared as "/" under prefix='/user', so the
  // trailing slash below avoids FastAPI's 307 redirect.
  private readonly usersUrl = 'http://127.0.0.1:8000/api/v1/user';
  private http = inject(HttpClient);

  getUsers(): Observable<AppUser[]> {
    return this.http.get<AppUser[]>(`${this.usersUrl}/`);
  }

  createUser(user: NewUser): Observable<AppUser> {
    return this.http.post<AppUser>(`${this.usersUrl}/`, user);
  }

  updateUser(id: string, patch: UserPatch): Observable<AppUser> {
    return this.http.patch<AppUser>(`${this.usersUrl}/${id}`, patch);
  }

  deleteUser(id: string): Observable<void> {
  return this.http.delete<void>(`${this.usersUrl}/${id}`);
  }
}
