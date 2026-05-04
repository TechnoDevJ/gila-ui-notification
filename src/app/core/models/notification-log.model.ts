export type ChannelType = 'SMS' | 'EMAIL' | 'PUSH';
export type NotificationStatus = 'PENDING' | 'SENT' | 'FAILED';

export interface NotificationLogResponse {
  id: number;
  messageId: number;
  userId: number;
  userName: string;
  channelType: ChannelType;
  status: NotificationStatus;
  attempts: number;
  errorMessage: string | null;
  sentAt: string | null;
}
