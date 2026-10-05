import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-contacts',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contacts.html',
  styleUrl: './contacts.css',
})
export class Contacts {

  private fb = inject(FormBuilder);

  contactForm!: FormGroup;
  isSending = signal(false);
  isSent = signal(false);

  readonly topics = [
    'General enquiry',
    'Technical support',
    'Sales & pricing',
    'Partnership',
  ];

  ngOnInit() {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      topic: [this.topics[0], [Validators.required]],
      message: ['', [Validators.required, Validators.minLength(20)]],
    });
  }

  // Convenience for the template's validation messages.
  invalid(control: string): boolean {
    const field = this.contactForm.get(control);
    return !!field && field.invalid && field.touched;
  }

  onSubmit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    // No contact endpoint exists yet - log the payload and show the success state.
    this.isSending.set(true);
    console.log('Contact request:', this.contactForm.value);
    setTimeout(() => {
      this.isSending.set(false);
      this.isSent.set(true);
    }, 700);
  }

  sendAnother(): void {
    this.isSent.set(false);
    this.contactForm.reset({ topic: this.topics[0] });
  }

}
