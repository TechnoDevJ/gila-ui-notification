import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NotificationLogResponse } from '../models/notification-log.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class LogService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getLogs(): Observable<NotificationLogResponse[]> {
    return this.http.get<NotificationLogResponse[]>(`${this.baseUrl}/logs`);
  }

  getLogsByMessageId(messageId: number): Observable<NotificationLogResponse[]> {
    return this.http.get<NotificationLogResponse[]>(`${this.baseUrl}/logs/${messageId}`);
  }
}
