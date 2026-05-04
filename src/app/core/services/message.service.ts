import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MessageResponse } from '../models/message-response.model';
import { SendMessageRequest } from '../models/send-message-request.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MessageService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  sendMessage(request: SendMessageRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.baseUrl}/messages`, request);
  }

  getMessages(): Observable<MessageResponse[]> {
    return this.http.get<MessageResponse[]>(`${this.baseUrl}/messages`);
  }
}
