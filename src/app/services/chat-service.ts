import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// Response interface for /train endpoint
export interface TrainResponse {
  message: string;
  chunks_processed?: number;
}

// Request payload interface for /chat endpoint
export interface ChatRequest {
  query: string;
}

// Response interface for /chat endpoint
export interface ChatResponse {
  query: string;
  response: any;
}

@Injectable({
  providedIn: 'root',
})

export class ChatService {

  private readonly baseUrl = 'http://localhost:8000';
  private http = inject(HttpClient)


  trainRag(files: File[] | FileList): Observable<TrainResponse> {
    const formData = new FormData();

    if (files instanceof FileList) {
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }
    } else {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }

    return this.http.post<TrainResponse>(`${this.baseUrl}/train`, formData);
  }


  getRagResponse(query: string): Observable<ChatResponse> {
    const payload: ChatRequest = { query };
    return this.http.post<ChatResponse>(`${this.baseUrl}/chat`, payload);
  }


}
