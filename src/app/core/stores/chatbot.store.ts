import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, of } from 'rxjs';
import { ChatMessage, ChatbotService } from '../services/chatbot.service';

export interface ChatbotState {
  isOpen: boolean;
  isLoading: boolean;
  userInput: string;
  hasUnread: boolean;
  showWelcomeCallout: boolean;
  messages: ChatMessage[];
  quickPrompts: string[];
}

const initialChatbotState: ChatbotState = {
  isOpen: false,
  isLoading: false,
  userInput: '',
  hasUnread: true,
  showWelcomeCallout: true,
  quickPrompts: [
    '💎 Active Promo Coupons',
    '🚚 Shipping & Delivery Time',
    '🔄 14-Day Return Policy',
    '💳 Supported Payment Options',
    '💎 أكواد الخصم والكوبونات',
    '🚚 الشحن ومدة التوصيل',
  ],
  messages: [
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: 'Greetings! I am your OWEL Luxury AI Concierge. How may I assist your shopping journey today? You can inquire regarding our audio masterpieces, express delivery, discount codes, or order tracking.',
      timestamp: new Date(),
    },
  ],
};

export const ChatbotStore = signalStore(
  { providedIn: 'root' },
  withState(initialChatbotState),
  withMethods((store, chatbotService = inject(ChatbotService)) => ({
    toggleChat() {
      const nextState = !store.isOpen();
      patchState(store, {
        isOpen: nextState,
        hasUnread: nextState ? false : store.hasUnread(),
        showWelcomeCallout: false,
      });
    },
    closeChat() {
      patchState(store, { isOpen: false });
    },
    dismissCallout() {
      patchState(store, { showWelcomeCallout: false });
    },
    setUserInput(input: string) {
      patchState(store, { userInput: input });
    },
    clearChat() {
      patchState(store, {
        messages: [
          {
            id: `welcome-${Date.now()}`,
            sender: 'assistant',
            text: 'Chat history cleared. How else may I assist you today?',
            timestamp: new Date(),
          },
        ],
      });
    },
    sendMessage: rxMethod<string>(
      pipe(
        tap((text) => {
          if (!text.trim() || store.isLoading()) return;
          const userMsg: ChatMessage = {
            id: `user-${Date.now()}`,
            sender: 'user',
            text: text.trim(),
            timestamp: new Date(),
          };
          patchState(store, {
            messages: [...store.messages(), userMsg],
            userInput: '',
            isLoading: true,
          });
        }),
        switchMap((text) =>
          chatbotService.sendMessage(text).pipe(
            tap((botReply) => {
              const assistantMsg: ChatMessage = {
                id: `assistant-${Date.now()}`,
                sender: 'assistant',
                text: botReply,
                timestamp: new Date(),
              };
              patchState(store, {
                messages: [...store.messages(), assistantMsg],
                isLoading: false,
              });
            }),
            catchError(() => {
              const errorMsg: ChatMessage = {
                id: `assistant-${Date.now()}`,
                sender: 'assistant',
                text: 'I apologize, our luxury concierge server is momentarily experiencing high demand. Please try again in a moment.',
                timestamp: new Date(),
              };
              patchState(store, {
                messages: [...store.messages(), errorMsg],
                isLoading: false,
              });
              return of(null);
            }),
          ),
        ),
      ),
    ),
  })),
);
