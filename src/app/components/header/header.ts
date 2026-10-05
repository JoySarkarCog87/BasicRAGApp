import { Component, inject, signal, Signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user-service';
import { OKTA_AUTH, OktaAuthStateService } from '@okta/okta-angular';
import { combineLatest, firstValueFrom } from 'rxjs';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-header',
  imports: [RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {

  private router = inject(Router);
  private userService = inject(UserService);
  private authStateService = inject(OktaAuthStateService);
  private oktaAuth = inject(OKTA_AUTH);
  private authService = inject(Auth);
  // auth: string | null = null;
  auth = signal<string | null>(null)
  isLoggedIn = signal(false);

  ngOnInit() {
    const u = localStorage.getItem('basicRAGAppUser')
    this.auth.set(localStorage.getItem('auth-provider'))

    if (u) {
      this.isLoggedIn.set(true);
      this.userService.isLoggedin.next(true);
    }
    combineLatest([
      this.authStateService.authState$,
      this.userService.isLoggedin
    ]).subscribe(([authState, userServiceLoggedIn]) => {
      console.log(authState);
      const isLoggedIn = Boolean(authState?.isAuthenticated || userServiceLoggedIn);
      this.isLoggedIn.set(isLoggedIn);
    });
  }

  onLogin() {
    this.router.navigateByUrl("/login");
  }

  async logout() {
    const authProvider = localStorage.getItem('auth-provider');
    if(authProvider=='okta'){
      this.authService.removeToken();
      await this.oktaAuth.signOut();     
      return;
    }
    localStorage.setItem('auth-provider','custom')
    localStorage.removeItem('basicRAGAppUser');
    this.userService.isLoggedin.next(false);
  }

}
