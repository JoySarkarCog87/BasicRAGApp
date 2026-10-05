import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user-service';
import { OKTA_AUTH, OktaAuthStateService } from '@okta/okta-angular';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private router = inject(Router);
  private oktaAuth = inject(OKTA_AUTH);
  private authStateService = inject(OktaAuthStateService);
  private authService = inject(Auth);

  loginForm!: FormGroup;
  showPassword = false;
  pageMode:string = 'Login'

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      // roles: this.fb.group({
      //   user: [true],
      //   admin: [false]
      // })
    });

    this.authStateService.authState$.subscribe(authState => {
      if (authState?.isAuthenticated) {
        this.userService.isLoggedin.next(true);
        this.router.navigateByUrl('adashboard');
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggolePageMode():void{
    this.pageMode = (this.pageMode=='Login')?'SignUp':'Login';
  }

  onSubmit(): void {
    if(this.loginForm.invalid) return;
    const user = this.loginForm.value;
    console.log(user);
    if(this.pageMode=='Login'){
      const success = this.userService.login(user.email, user.password);
      console.log('Login success : '+success)
      if(success){
        localStorage.setItem('auth-provider', 'custom');
        this.authService.saveToken(this.authService.generateToken());
        this.router.navigateByUrl('home')
      }

    }else{
      console.log('Start signup....')
    }
  }

  async openOktaLogin(){
    localStorage.setItem('auth-provider', 'okta');
    this.authService.saveToken(this.authService.generateToken());

    // signInWithRedirect only stores the originalUri when one is passed; without it
    // the callback restores '/' and lands on home instead of the dashboard.
    await this.oktaAuth.signInWithRedirect({ originalUri: '/adashboard' });
  }

}
