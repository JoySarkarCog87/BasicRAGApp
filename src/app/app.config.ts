import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideOktaAuth, withOktaConfig } from '@okta/okta-angular';

import { routes } from './app.routes';
import OktaAuth from '@okta/okta-auth-js';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptor/auth-interceptor';

const oktaAuth = new OktaAuth({
  issuer:'https://integrator-1111220.okta.com/oauth2/default',
  clientId:'0oa176udmrn9jsorV698',
  redirectUri:'/login/callback',
  postLogoutRedirectUri: 'http://localhost:4200/login'
})

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    provideOktaAuth(
      withOktaConfig({
        oktaAuth
      })
    )
  ]
};
