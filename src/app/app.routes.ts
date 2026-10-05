import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { chatbotGuard } from './guards/chatbot-guard';
import { canActivateAuthGuard, OktaCallbackComponent } from '@okta/okta-angular';

export const routes: Routes = [
    {path:"", redirectTo: 'home', pathMatch:'full'},
    {path:"home", component: Home},
    {path:"login/callback", component: OktaCallbackComponent},
    {path:"login", loadComponent: ()=>import('./components/login/login').then(r=>r.Login)},
    {path:"adashboard", loadComponent: ()=>import('./components/adashboard/adashboard').then(r=>r.Adashboard), canActivate:[canActivateAuthGuard]},
    {path:"chatbot", loadComponent: ()=>import('./components/chatbot/chatbot').then(r=>r.Chatbot), canActivate:[chatbotGuard]},
    {path:"contact", loadComponent: ()=>import('./components/contacts/contacts').then(r=>r.Contacts)},
    {path:"aboutus", loadComponent: ()=>import('./components/aboutus/aboutus').then(r=>r.Aboutus)},
];
