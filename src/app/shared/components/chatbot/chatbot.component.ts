import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  effect,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotStore } from '../../../core/stores/chatbot.store';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
})
export class ChatbotComponent implements OnInit {
  chatbotStore = inject(ChatbotStore);

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef<HTMLDivElement>;

  constructor() {
    effect(() => {
      // Automatically scroll to bottom when messages change
      const msgs = this.chatbotStore.messages();
      if (msgs.length > 0) {
        setTimeout(() => this.scrollToBottom(), 50);
      }
    });
  }

  isArabic(text: string): boolean {
    if (!text) return false;
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    return arabicRegex.test(text);
  }

  ngOnInit() {
    setTimeout(() => {
      this.chatbotStore.dismissCallout();
    }, 8000);
  }

  toggleChat() {
    this.chatbotStore.toggleChat();
    if (this.chatbotStore.isOpen()) {
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  closeChat() {
    this.chatbotStore.closeChat();
  }

  clearChat() {
    this.chatbotStore.clearChat();
  }

  sendQuickPrompt(promptText: string) {
    const cleanText = promptText.replace(/^[^\w\s\u0600-\u06FF]+/, '').trim();
    this.chatbotStore.sendMessage(cleanText);
  }

  handleSendMessage() {
    const text = this.chatbotStore.userInput().trim();
    if (!text || this.chatbotStore.isLoading()) return;
    this.chatbotStore.sendMessage(text);
  }

  private scrollToBottom() {
    try {
      if (this.messagesContainer?.nativeElement) {
        this.messagesContainer.nativeElement.scrollTop =
          this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch {}
  }
}
