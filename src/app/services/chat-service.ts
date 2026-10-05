import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// Response interface for /train endpoint
export interface TrainResponse {
  // message: string;
  // chunks_processed?: number;
  status:string,
  message?:string,
  user_id?:string,
}

// Request payload interface for /chat endpoint
export interface ChatRequest {
  query: string;
}

// Response interface for /chat endpoint
export interface ChatResponse {
  // query: string;
  // response: any;
  answer: string;
  documents: string
}

@Injectable({
  providedIn: 'root',
})

export class ChatService {

  // private readonly baseUrl = 'http://localhost:8000';
  private readonly baseUrl = 'http://localhost:8002';
  private http = inject(HttpClient)


  trainRag(files: File[] | FileList): Observable<TrainResponse> {
    const formData = new FormData();

    if (files instanceof FileList) {
      for (let i = 0; i < files.length; i++) {
        formData.append('file', files[i]);
      }
    } else {
      files.forEach((file) => {
        formData.append('file', file);
      });
    }

    return this.http.post<TrainResponse>(`${this.baseUrl}/api/v1/upload`, formData);
  }


  getRagResponse(query: string): Observable<ChatResponse> {
    const payload: ChatRequest = { query };
    return this.http.post<ChatResponse>(`${this.baseUrl}/api/v1/ask`, payload);
  }


}
