import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user-service';

@Component({
  selector: 'app-aboutus',
  imports: [],
  templateUrl: './aboutus.html',
  styleUrl: './aboutus.css',
})
export class Aboutus {


    // //practice for signal modal
    // modalOpen = signal(false);

    // username=signal('');

    // openModal():void{
    //   this.modalOpen.set(true);
    // }

    //   closeModal():void{
    //     this.modalOpen.set(false);
    //   }
      
    //   saveName(name: string) {

    //   this.username.set(name);

    //   this.closeModal();

    // }


  private router = inject(Router);
  private userService = inject(UserService);

  readonly stats = [
    { value: '1.5M+', label: 'Chunks indexed', icon: 'bi-database-fill' },
    { value: '<400ms', label: 'Median retrieval', icon: 'bi-lightning-charge-fill' },
    { value: '94%', label: 'Top-1 match rate', icon: 'bi-bullseye' },
    { value: '12', label: 'Source connectors', icon: 'bi-plug-fill' },
  ];

  readonly values = [
    {
      icon: 'bi-patch-check-fill',
      title: 'Grounded over generative',
      body: 'If the source material does not support an answer, the model says so. We would rather return nothing than return a confident guess.',
    },
    {
      icon: 'bi-eye-fill',
      title: 'Traceable by default',
      body: 'Every response carries the chunks it was built from, with scores. You can always see why the model said what it said.',
    },
    {
      icon: 'bi-sliders',
      title: 'Yours to control',
      body: 'Bring your own vector store, embedding model, and identity provider. No lock-in to a single hosted stack.',
    },
  ];

  readonly stack = [
    { name: 'Angular 21', note: 'Signals-first frontend' },
    { name: 'FastAPI', note: 'Ingestion & chat API' },
    { name: 'Okta', note: 'Enterprise SSO' },
    { name: 'Vector DB', note: 'Hybrid BM25 + ANN search' },
  ];

  isLoggedIn = signal(false);

  ngOnInit() {
    this.isLoggedIn.set(this.userService.isLoggedin.getValue());
  }

  getStarted(): void {
    this.router.navigateByUrl(this.isLoggedIn() ? 'chatbot' : 'login');
  }

}
