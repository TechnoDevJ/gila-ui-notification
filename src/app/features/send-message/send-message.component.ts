import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { interval, Subject, takeUntil, switchMap } from 'rxjs';
import { CategoryService } from '../../core/services/category.service';
import { MessageService } from '../../core/services/message.service';
import { LogService } from '../../core/services/log.service';
import { Category } from '../../core/models/category.model';
import { MessageResponse } from '../../core/models/message-response.model';
import { NotificationLogResponse } from '../../core/models/notification-log.model';
import { ApiError } from '../../core/models/api-error.model';

@Component({
  selector: 'app-send-message',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTableModule,
  ],
  templateUrl: './send-message.component.html',
  styleUrl: './send-message.component.scss',
})
export class SendMessageComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly categoryService = inject(CategoryService);
  private readonly messageService = inject(MessageService);
  private readonly logService = inject(LogService);
  private readonly destroy$ = new Subject<void>();
  private readonly stopPolling$ = new Subject<void>();

  categories: Category[] = [];
  loading = false;
  submitting = false;
  errorMessage = '';
  sentMessage: MessageResponse | null = null;
  logs: NotificationLogResponse[] = [];
  pollingActive = false;
  pollingTimeout = false;
  readonly logColumns = ['userName', 'channelType', 'status', 'attempts', 'errorMessage'];
  readonly maxBodyLength = 500;

  form = this.fb.group({
    categoryName: ['', Validators.required],
    body: ['', [Validators.required, Validators.maxLength(this.maxBodyLength)]],
  });

  get bodyValue(): string {
    return this.form.get('body')?.value || '';
  }

  get remainingChars(): number {
    return this.maxBodyLength - this.bodyValue.length;
  }

  ngOnInit(): void {
    this.loading = true;
    this.categoryService.getCategories().pipe(takeUntil(this.destroy$)).subscribe({
      next: cats => {
        this.categories = cats;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Failed to load categories.';
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.submitting) return;

    const { categoryName, body } = this.form.value;
    this.submitting = true;
    this.errorMessage = '';
    this.sentMessage = null;
    this.logs = [];
    this.pollingTimeout = false;
    this.stopPolling$.next();

    this.messageService
      .sendMessage({ categoryName: categoryName!, body: body! })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: msg => {
          this.sentMessage = msg;
          this.submitting = false;
          this.form.reset();
          this.startPolling(msg.id);
        },
        error: (err: ApiError) => {
          this.submitting = false;
          this.errorMessage = err.message || 'Failed to send message.';
        },
      });
  }

  private startPolling(messageId: number): void {
    this.pollingActive = true;
    const stopTimeout$ = new Subject<void>();

    setTimeout(() => {
      stopTimeout$.next();
      stopTimeout$.complete();
      if (this.pollingActive) {
        this.pollingTimeout = true;
        this.pollingActive = false;
      }
    }, 15_000);

    interval(1_000)
      .pipe(
        takeUntil(this.stopPolling$),
        takeUntil(stopTimeout$),
        switchMap(() => this.logService.getLogsByMessageId(messageId))
      )
      .subscribe({
        next: logs => {
          this.logs = logs;
          const allDone =
            logs.length > 0 &&
            logs.every(l => l.status === 'SENT' || l.status === 'FAILED');
          if (allDone) {
            this.pollingActive = false;
            this.stopPolling$.next();
          }
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopPolling$.next();
    this.stopPolling$.complete();
  }
}
