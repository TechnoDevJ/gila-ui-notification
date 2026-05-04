import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LogService } from '../../core/services/log.service';
import { NotificationLogResponse } from '../../core/models/notification-log.model';

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    RouterLink,
    MatTableModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './logs.component.html',
  styleUrl: './logs.component.scss',
})
export class LogsComponent implements OnInit {
  private readonly logService = inject(LogService);
  private readonly route = inject(ActivatedRoute);

  logs: NotificationLogResponse[] = [];
  loading = false;
  errorMessage = '';
  messageId: number | null = null;
  readonly displayedColumns = [
    'id', 'messageId', 'userName', 'channelType', 'status', 'attempts', 'sentAt', 'errorMessage',
  ];

  get pageTitle(): string {
    return this.messageId ? `Logs for Message #${this.messageId}` : 'All Notification Logs';
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const id = params['messageId'];
      this.messageId = id ? Number(id) : null;
      this.loadLogs();
    });
  }

  loadLogs(): void {
    this.loading = true;
    this.errorMessage = '';
    const obs = this.messageId
      ? this.logService.getLogsByMessageId(this.messageId)
      : this.logService.getLogs();

    obs.subscribe({
      next: logs => {
        this.logs = logs;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Failed to load logs.';
      },
    });
  }
}
