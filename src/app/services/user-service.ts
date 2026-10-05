import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import users from '../database/users';
import { HttpClient } from '@angular/common/http';
 interface loginResponse {
  id: string;
  email: string;
  role: string;
 }
@Injectable({
  providedIn: 'root',
})
export class UserService {
  isLoggedin = new BehaviorSubject(false);

  private http= inject(HttpClient);
  private apiurl='http://127.0.0.1:8000';
 

  login(email:string, password:string):Observable<loginResponse>{
    localStorage.setItem('basicRAGAppUser', JSON.stringify({email, password, role:'user'}));
    this.isLoggedin.next(true);
    return this.http.post<loginResponse>(`${this.apiurl}/api/v1/user/login`, {email, password});
  }

  }




  // login(email:string, password:string):boolean{
  //   const user = users.find(user=>user.email==email && user.password==password);
  //   if(user){
  //     localStorage.setItem('basicRAGAppUser', JSON.stringify(user));
  //     this.isLoggedin.next(true);
  //     return true;
  //   }
  //   return false;
  // }
  