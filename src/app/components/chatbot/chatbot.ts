import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatResponse, ChatService, TrainResponse } from '../../services/chat-service';

@Component({
  selector: 'app-chatbot',
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.html',
  styleUrl: './chatbot.css',
})
export class Chatbot {
  
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
 

  private ragService = inject(ChatService);

  // Pipeline Step State: 0 = Idle, 1 = Uploaded, 2 = Chunked, 3 = Embedded, 4 = Vector Stored, 5 = Complete
  currentStep: number = 0;
  failedStep: number | null = null; // Set step index if processing fails (e.g., 2)
  isReady: boolean = false;
  userInput: string = '';
  isThinking = false;
  

  messages = signal([
    {
       sender: 'bot',
       text: 'Upload pdf or text documents first to start the conversation...',
       time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // Uploading and calling the real /train backend service
  onFileUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const files = input.files;
    const fileName = files[0].name;
    this.currentStep = 1;
    this.failedStep = null;
    this.isReady = false;

    // Visual step progression while backend processes files
    const stepTimer1 = setTimeout(() => this.currentStep = 2, 1000); // Chunking
    const stepTimer2 = setTimeout(() => this.currentStep = 3, 1100); // Embedding
    const stepTimer3 = setTimeout(() => this.currentStep = 4, 1200); // Vector DB Storage

    this.ragService.trainRag(files).subscribe({
      next: (response: TrainResponse) => {
        // Clear remaining timeouts if API returned faster
        clearTimeout(stepTimer1);
        clearTimeout(stepTimer2);
        clearTimeout(stepTimer3);

        this.currentStep = 5;
        this.isReady = true;
        // Bot confirmation message
        this.messages.update(mes => [...mes, {
          sender: 'bot',
          text: `Successfully ingested and indexed "${fileName}". ${response.message || 'You can now ask questions!'}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        this.scrollToBottom();
      },
      error: (err) => {
        clearTimeout(stepTimer1);
        clearTimeout(stepTimer2);
        clearTimeout(stepTimer3);

        // Mark current running step as failed
        this.failedStep = this.currentStep > 0 ? this.currentStep : 1;
        this.isReady = false;

        const errorMsg = err.error?.detail || 'An error occurred during document processing.';
        this.messages.update(mes => [...mes, {
          sender: 'bot',
          text: `Failed to process document: ${errorMsg}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        this.scrollToBottom();
      }
    });
  }

  // Sends user prompt to real /chat backend service
  sendMessage(): void {
    if (!this.userInput.trim() || !this.isReady) return;

    const userText = this.userInput;
    this.messages.update(msg => [...msg, {
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    this.messages.update(msg => [...msg, {
      sender: 'bot',
      text: '🤖 Thinking..........',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);

    this.userInput = '';
    this.scrollToBottom();

    // Call real /chat service
    this.ragService.getRagResponse(userText).subscribe({
      next: (response: ChatResponse) => {
        this.messages.update(msg => {
          msg.pop();
          return [...msg, {
            sender: 'bot',
            text: response.response?.answer,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]
        });
        this.scrollToBottom();
      },
      error: (err) => {
        const errorMsg = err.error?.detail || 'Failed to fetch response from server.';
        this.messages.update(msg => {
          msg.pop();
          return [...msg, {
            sender: 'bot',
            text: `Error: ${errorMsg}`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]
        });
        this.scrollToBottom();
      }
    });
  }

  // Stepper Visual Helper Methods
  getStepClass(stepNumber: number): string {
    if (this.failedStep === stepNumber) return 'bg-danger text-white';
    if (this.currentStep >= stepNumber) return 'bg-success text-white shadow-sm';
    if (this.currentStep === stepNumber - 1) return 'bg-primary text-white spinner-grow-custom';
    return 'bg-light text-muted border';
  }

  getStepIcon(stepNumber: number, defaultIcon: string): string {
    if (this.failedStep === stepNumber) return 'bi-x-lg';
    if (this.currentStep >= stepNumber) return 'bi-check-lg';
    return defaultIcon;
  }

  resetPipeline(): void {
    this.currentStep = 0;
    this.failedStep = null;
    this.isReady = false;
    this.messages.set([{
      sender: 'bot',
      text: 'Session reset. Please upload a document to proceed.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }])
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }
    }, 50);
  }
}