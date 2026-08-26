import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

export interface WebhookResponse {
  output?: string;
  response?: string;
  message?: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root',
})
export class ChatbotService {
  private http = inject(HttpClient);
  private webhookUrl = environment.n8nWebhookUrl;

  sendMessage(message: string): Observable<string> {
    const payload = {
      message,
      input: message,
      query: message,
      prompt: message,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    });

    return this.http.post<WebhookResponse | string>(this.webhookUrl, payload, { headers }).pipe(
      map((res: any) => {
        if (typeof res === 'string') {
          return res;
        }
        if (res && typeof res === 'object') {
          if (res.output) return res.output;
          if (res.response) return res.response;
          if (res.message) return res.message;
          if (res.data?.output) return res.data.output;
        }
        return 'Thank you for contacting OWEL Concierge. How else may I assist you?';
      }),
      catchError(() => {
        return of(
          'I apologize, our luxury concierge server is momentarily experiencing high demand or connectivity updates. Please feel free to ask again or reach our team at concierge@owel.com.',
        );
      }),
    );
  }
}
