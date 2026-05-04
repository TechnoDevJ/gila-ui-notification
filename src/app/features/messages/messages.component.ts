import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MessageService } from '../../core/services/message.service';
import { MessageResponse } from '../../core/models/message-response.model';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    RouterLink,
    MatTableModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss',
})
export class MessagesComponent implements OnInit {
  private readonly messageService = inject(MessageService);

  messages: MessageResponse[] = [];
  loading = false;
  errorMessage = '';
  readonly displayedColumns = ['id', 'categoryName', 'body', 'createdAt', 'actions'];

  ngOnInit(): void {
    this.loadMessages();
  }

  loadMessages(): void {
    this.loading = true;
    this.errorMessage = '';
    this.messageService.getMessages().subscribe({
      next: msgs => {
        this.messages = msgs;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Failed to load messages.';
      },
    });
  }

  truncate(text: string, limit = 80): string {
    return text.length > limit ? text.substring(0, limit) + '...' : text;
  }
}
