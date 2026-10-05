import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user-service';
import { OktaAuthStateService } from '@okta/okta-angular';
import { combineLatest, take } from 'rxjs';

@Component({
  selector: 'app-home',
  imports: [RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  
  private router = inject(Router);
  private userService = inject(UserService);
  private isLoggedIn = signal(false);
  private authStateService = inject(OktaAuthStateService);

  ngOnInit(){
    combineLatest([
      this.authStateService.authState$,
      this.userService.isLoggedin
    ]).pipe(
      take(1)
    )
    .subscribe(([authState, userServiceLoggedIn]) => {
      console.log(authState);
      const isLoggedIn = Boolean(authState?.isAuthenticated || userServiceLoggedIn);
      this.isLoggedIn.set(isLoggedIn);
      this.userService.isLoggedin.next(isLoggedIn);
    });
  }

  getStarted(){
    console.log("Login status : "+this.isLoggedIn())
    if(this.isLoggedIn()){
      console.log("if running")
      this.router.navigateByUrl('chatbot');
    }
    else {
      console.log("else running")
      this.router.navigateByUrl('login');
    }
  }
}
