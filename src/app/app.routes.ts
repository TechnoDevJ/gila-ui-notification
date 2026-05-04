import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'send', pathMatch: 'full' },
  {
    path: 'send',
    loadComponent: () =>
      import('./features/send-message/send-message.component').then(m => m.SendMessageComponent),
  },
  {
    path: 'messages',
    loadComponent: () =>
      import('./features/messages/messages.component').then(m => m.MessagesComponent),
  },
  {
    path: 'logs',
    loadComponent: () =>
      import('./features/logs/logs.component').then(m => m.LogsComponent),
  },
  { path: '**', redirectTo: 'send' },
];
