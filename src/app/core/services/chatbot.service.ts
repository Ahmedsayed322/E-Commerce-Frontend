import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
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
  private platformId = inject(PLATFORM_ID);
  private webhookUrl = environment.n8nWebhookUrl;

  private currentSessionId: string | null = null;

  /**
   * Generates or retrieves the active random session ID.
   */
  getSessionId(): string {
    if (this.currentSessionId) {
      return this.currentSessionId;
    }

    if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('owel_chat_session_id');
      if (stored) {
        this.currentSessionId = stored;
        return stored;
      }
    }

    this.currentSessionId = this.generateRandomSessionId();
    if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined') {
      window.localStorage.setItem('owel_chat_session_id', this.currentSessionId);
    }
    return this.currentSessionId;
  }

  /**
   * Resets the session ID (e.g. when chat history is cleared)
   */
  resetSessionId(): string {
    this.currentSessionId = this.generateRandomSessionId();
    if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined') {
      window.localStorage.setItem('owel_chat_session_id', this.currentSessionId);
    }
    return this.currentSessionId;
  }

  private generateRandomSessionId(): string {
    const randomHex = Math.random().toString(36).substring(2, 10);
    const timestamp = Date.now().toString(36);
    return `owel_sess_${timestamp}_${randomHex}`;
  }

  sendMessage(message: string): Observable<string> {
    const sessionId = this.getSessionId();

    const payload = {
      message,
      input: message,
      query: message,
      prompt: message,
      sessionId,
      session_id: sessionId,
      chatSessionId: sessionId,
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
          if (res.text) return res.text;
        }
        return 'Thank you for reaching out. How else may I assist you?';
      }),
      catchError(() => {
        return of(
          'Our assistant is momentarily reconnecting. Please feel free to ask again or reach our team at support@owel.com.',
        );
      }),
    );
  }
}
